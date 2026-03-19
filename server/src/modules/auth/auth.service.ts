import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                phone: registerDto.phone,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });

        return {
            message: 'User registered successfully',
            user,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
                outlets: {
                    include: {
                        outlet: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                createdAt: true,
                roles: { include: { role: true } },
                outlets: { include: { outlet: true } },
            },
        });

        if (!user) throw new UnauthorizedException('User not found');
        return user;
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: { include: { role: true } } },
        });

        if (!currentUser) {
            throw new UnauthorizedException('User not found');
        }

        const isEmailChanging = dto.email && dto.email !== currentUser.email;
        const isPasswordChanging = Boolean(dto.password);

        if (isEmailChanging) {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existing && existing.id !== userId) {
                throw new ConflictException('Cette adresse email est déjà utilisée');
            }
        }

        const updateData: any = {};
        if (dto.name) updateData.name = dto.name;
        if (dto.phone !== undefined) updateData.phone = dto.phone;
        if (dto.email) updateData.email = dto.email;
        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 10);
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isActive: true,
                roles: { include: { role: true } },
                outlets: { include: { outlet: true } },
            },
        });

        // Notify admins for security-sensitive profile changes done by non-admin users
        if (isEmailChanging || isPasswordChanging) {
            const isAdmin = currentUser.roles.some((ur) =>
                ur.role.name.toLowerCase().includes('admin'),
            );

            if (!isAdmin) {
                const recipients = await this.getAdminNotificationRecipients(userId);
                recipients.forEach((adminEmail) => {
                    if (isEmailChanging) {
                        this.emailService
                            .sendEmailChangeNotification(
                                adminEmail,
                                currentUser.name,
                                currentUser.email,
                            )
                            .catch((err) => {
                                console.error('Failed to send email change notification:', err.message);
                            });
                    }

                    if (isPasswordChanging) {
                        this.emailService
                            .sendPasswordChangeNotification(
                                adminEmail,
                                currentUser.name,
                                currentUser.email,
                            )
                            .catch((err) => {
                                console.error('Failed to send password change notification:', err.message);
                            });
                    }
                });
            }
        }

        return updated;
    }

    async refreshToken(refreshToken: string) {
        try {
            const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
            const payload = this.jwtService.verify(refreshToken, {
                secret: refreshSecret,
            });

            const tokenHash = this.hashToken(refreshToken);
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: tokenHash },
                include: { user: true },
            });

            if (!storedToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (storedToken.user.id !== payload.sub) {
                await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (new Date() > storedToken.expiresAt) {
                await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
                throw new UnauthorizedException('Refresh token expired');
            }

            const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email);
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(refreshToken: string) {
        try {
            const tokenHash = this.hashToken(refreshToken);
            await this.prisma.refreshToken.delete({ where: { token: tokenHash } });
            return { message: 'Logged out successfully' };
        } catch {
            throw new BadRequestException('Invalid refresh token');
        }
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };
        const accessSecret = this.getRequiredConfig('JWT_ACCESS_SECRET');
        const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessSecret,
                expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: refreshSecret,
                expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, token: string) {
        const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
        const expiresAt = new Date();
        const tokenHash = this.hashToken(token);

        const match = expiresIn.match(/^(\d+)([dhm])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
                case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
                case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
            }
        }

        await this.prisma.refreshToken.create({ data: { token: tokenHash, userId, expiresAt } });
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private getRequiredConfig(key: string): string {
        const value = this.configService.get<string>(key);
        if (!value) {
            throw new Error(`${key} is not configured`);
        }
        return value;
    }

    private async getAdminNotificationRecipients(excludeUserId: string): Promise<string[]> {
        const recipients = new Set<string>();

        const adminEmailFromConfig = this.configService.get<string>('ADMIN_EMAIL');
        if (adminEmailFromConfig) {
            recipients.add(adminEmailFromConfig.toLowerCase());
        }

        const adminUsers = await this.prisma.user.findMany({
            where: {
                id: { not: excludeUserId },
                isActive: true,
                roles: {
                    some: {
                        role: {
                            name: {
                                contains: 'admin',
                                mode: 'insensitive',
                            },
                        },
                    },
                },
            },
            select: { email: true },
        });

        adminUsers.forEach((admin) => {
            if (admin.email) {
                recipients.add(admin.email.toLowerCase());
            }
        });

        return [...recipients];
    }
}
