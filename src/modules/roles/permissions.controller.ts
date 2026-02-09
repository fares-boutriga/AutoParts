import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all available permissions',
        description: 'Returns a list of all system permissions. Used by admin interfaces for role management and custom role creation. The "key" field contains the permission identifier used in the system.'
    })
    @ApiResponse({
        status: 200,
        description: 'List of all permissions',
        schema: {
            example: [
                {
                    id: 'uuid-1',
                    key: 'manage_stock',
                    description: 'Update stock levels and manage inventory'
                },
                {
                    id: 'uuid-2',
                    key: 'sell_products',
                    description: 'Create orders and process sales'
                },
                {
                    id: 'uuid-3',
                    key: 'manage_outlets',
                    description: 'Create, update, delete outlets'
                }
            ]
        }
    })
    async findAll() {
        const permissions = await this.prisma.permission.findMany({
            select: {
                id: true,
                name: true,
                description: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Map 'name' to 'key' as per requirements
        return permissions.map((permission) => ({
            id: permission.id,
            key: permission.name,
            description: permission.description,
        }));
    }
}
