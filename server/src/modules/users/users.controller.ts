import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    @RequirePermissions('manage_users')
    @ApiOperation({ summary: 'Create new user' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @RequirePermissions('manage_users')
    @ApiOperation({ summary: 'Get all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user details' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('manage_users')
    @ApiOperation({ summary: 'Update user' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Post(':id/outlets')
    @RequirePermissions('manage_users')
    @ApiOperation({ summary: 'Assign outlets to user' })
    assignOutlets(@Param('id') id: string, @Body('outletIds') outletIds: string[]) {
        return this.usersService.assignOutlets(id, outletIds);
    }

    @Post(':id/roles')
    @RequirePermissions('manage_users')
    @ApiOperation({ summary: 'Assign roles to user' })
    assignRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[]) {
        return this.usersService.assignRoles(id, roleIds);
    }

    @Delete(':id')
    @RequirePermissions('manage_users')
    @ApiOperation({ summary: 'Delete user' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
