import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService) { }

    @Post()
    @RequirePermissions('manage_roles')
    @ApiOperation({ summary: 'Create custom role' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get role details' })
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Post(':id/permissions')
    @RequirePermissions('manage_roles')
    @ApiOperation({ summary: 'Assign permissions to role' })
    assignPermissions(
        @Param('id') id: string,
        @Body('permissionIds') permissionIds: string[],
    ) {
        return this.rolesService.assignPermissions(id, permissionIds);
    }

    @Delete(':id')
    @RequirePermissions('manage_roles')
    @ApiOperation({ summary: 'Delete custom role' })
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
