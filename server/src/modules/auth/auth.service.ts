import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create user
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
        // Find user
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

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Save refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Check if refresh token exists in database
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });

            if (!storedToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Check if token is expired
            if (new Date() > storedToken.expiresAt) {
                await this.prisma.refreshToken.delete({
                    where: { id: storedToken.id },
                });
                throw new UnauthorizedException('Refresh token expired');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(
                storedToken.user.id,
                storedToken.user.email,
            );

            // Delete old refresh token
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });

            // Save new refresh token
            await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(refreshToken: string) {
        try {
            await this.prisma.refreshToken.delete({
                where: { token: refreshToken },
            });
            return { message: 'Logged out successfully' };
        } catch {
            throw new BadRequestException('Invalid refresh token');
        }
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async saveRefreshToken(userId: string, token: string) {
        const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
        const expiresAt = new Date();

        // Parse expiration string (e.g., "7d", "24h")
        const match = expiresIn.match(/^(\d+)([dhm])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case 'd':
                    expiresAt.setDate(expiresAt.getDate() + value);
                    break;
                case 'h':
                    expiresAt.setHours(expiresAt.getHours() + value);
                    break;
                case 'm':
                    expiresAt.setMinutes(expiresAt.getMinutes() + value);
                    break;
            }
        }

        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }
}
