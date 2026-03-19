import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoreSettingsService } from './store-settings.service';
import { CreateStoreSettingsDto } from './dto/create-store-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Store Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('manage_outlets')
@Controller('store-settings')
export class StoreSettingsController {
    constructor(private storeSettingsService: StoreSettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get store settings' })
    get() {
        return this.storeSettingsService.getOrCreate();
    }

    @Patch()
    @ApiOperation({ summary: 'Update store settings' })
    update(@Body() dto: CreateStoreSettingsDto) {
        return this.storeSettingsService.update(dto);
    }
}
