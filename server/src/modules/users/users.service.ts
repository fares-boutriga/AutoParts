import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existing) throw new ConflictException('Email already exists');

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const { password, ...userData } = createUserDto;

        return this.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
            select: { id: true, email: true, name: true, phone: true, isActive: true },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
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
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: { include: { role: true } },
                outlets: { include: { outlet: true } },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const { password, ...result } = user;
        return result;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: updateUserDto,
            });
            const { password, ...result } = user;
            return result;
        } catch {
            throw new NotFoundException('User not found');
        }
    }

    async assignOutlets(userId: string, outletIds: string[]) {
        // Delete existing
        await this.prisma.userOutlet.deleteMany({ where: { userId } });

        // Create new
        await this.prisma.userOutlet.createMany({
            data: outletIds.map((outletId) => ({ userId, outletId })),
        });

        return this.findOne(userId);
    }

    async assignRoles(userId: string, roleIds: string[]) {
        // Delete existing
        await this.prisma.userRole.deleteMany({ where: { userId } });

        // Create new
        await this.prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({ userId, roleId })),
        });

        return this.findOne(userId);
    }

    async remove(id: string) {
        try {
            return await this.prisma.user.delete({ where: { id } });
        } catch {
            throw new NotFoundException('User not found');
        }
    }
}
