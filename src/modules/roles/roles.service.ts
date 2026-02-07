import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async create(createRoleDto: CreateRoleDto) {
        // Only allow creating custom roles via API
        return this.prisma.role.create({
            data: {
                ...createRoleDto,
                isCustom: true,
            },
        });
    }

    async findAll() {
        return this.prisma.role.findMany({
            include: { permissions: { include: { permission: true } } },
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { permissions: { include: { permission: true } } },
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async assignPermissions(roleId: string, permissionIds: string[]) {
        // Delete existing
        await this.prisma.rolePermission.deleteMany({ where: { roleId } });

        // Create new
        await this.prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        });

        return this.findOne(roleId);
    }

    async remove(id: string) {
        const role = await this.findOne(id);
        if (!role.isCustom) {
            throw new BadRequestException('Cannot delete system default roles');
        }

        return this.prisma.role.delete({ where: { id } });
    }
}
