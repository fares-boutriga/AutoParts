import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    @RequirePermissions('view_notifications')
    @ApiOperation({ summary: 'Get all notifications' })
    @ApiQuery({ name: 'outletId', required: false })
    findAll(@Query('outletId') outletId?: string) {
        return this.notificationsService.findAll(outletId);
    }

    @Patch(':id/seen')
    @RequirePermissions('view_notifications')
    @ApiOperation({ summary: 'Mark notification as seen' })
    markAsSeen(@Param('id') id: string) {
        return this.notificationsService.markAsSeen(id);
    }

    @Patch('seen-all')
    @RequirePermissions('view_notifications')
    @ApiOperation({ summary: 'Mark all notifications as seen for outlet' })
    @ApiQuery({ name: 'outletId', required: true })
    markAllAsSeen(@Query('outletId') outletId: string) {
        return this.notificationsService.markAllAsSeen(outletId);
    }

    @Delete(':id')
    @RequirePermissions('view_notifications')
    @ApiOperation({ summary: 'Delete notification' })
    remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }
}
