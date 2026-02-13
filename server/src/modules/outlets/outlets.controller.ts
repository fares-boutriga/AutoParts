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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { UpdateOutletAlertsDto } from './dto/update-outlet-alerts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Outlets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('outlets')
export class OutletsController {
    constructor(private outletsService: OutletsService) { }

    @Post()
    @RequirePermissions('manage_outlets')
    @ApiOperation({ summary: 'Create new outlet' })
    @ApiBody({ type: CreateOutletDto })
    create(@Body() createOutletDto: CreateOutletDto) {
        return this.outletsService.create(createOutletDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all outlets' })
    findAll() {
        return this.outletsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get outlet by ID' })
    findOne(@Param('id') id: string) {
        return this.outletsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('manage_outlets')
    @ApiOperation({ summary: 'Update outlet' })
    @ApiBody({ type: UpdateOutletDto })
    update(@Param('id') id: string, @Body() updateOutletDto: UpdateOutletDto) {
        return this.outletsService.update(id, updateOutletDto);
    }

    @Patch(':id/alerts')
    @RequirePermissions('manage_outlets')
    @ApiOperation({
        summary: 'Update outlet stock alert settings',
        description: 'Configure stock alert notifications for an outlet. When alerts are enabled, an email address must be provided. Stock alerts will be sent when inventory falls below minimum levels.'
    })
    @ApiParam({
        name: 'id',
        description: 'Outlet ID',
        example: 'uuid-here',
        type: String
    })
    @ApiResponse({
        status: 200,
        description: 'Alert settings updated successfully',
        schema: {
            example: {
                id: 'uuid',
                name: 'Main Store',
                address: '123 Auto Street',
                phone: '+1234567890',
                email: 'admin@outlet.com',
                alertsEnabled: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed - email required when alerts enabled'
    })
    @ApiResponse({
        status: 404,
        description: 'Outlet not found'
    })
    @ApiBody({ type: UpdateOutletAlertsDto })
    updateAlerts(@Param('id') id: string, @Body() updateAlertsDto: UpdateOutletAlertsDto) {
        return this.outletsService.updateAlertSettings(id, updateAlertsDto);
    }

    @Delete(':id')
    @RequirePermissions('manage_outlets')
    @ApiOperation({ summary: 'Delete outlet' })
    remove(@Param('id') id: string) {
        return this.outletsService.remove(id);
    }
}
