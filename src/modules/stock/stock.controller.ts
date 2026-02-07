import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stock')
export class StockController {
    constructor(private stockService: StockService) { }

    @Post()
    @RequirePermissions('manage_stock')
    @ApiOperation({ summary: 'Create stock record' })
    create(@Body() createStockDto: CreateStockDto) {
        return this.stockService.create(createStockDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all stock records' })
    @ApiQuery({ name: 'outletId', required: false })
    @ApiQuery({ name: 'productId', required: false })
    findAll(@Query('outletId') outletId?: string, @Query('productId') productId?: string) {
        return this.stockService.findAll({ outletId, productId });
    }

    @Get('outlet/:outletId')
    @ApiOperation({ summary: 'Get stock for outlet' })
    findByOutlet(@Param('outletId') outletId: string) {
        return this.stockService.findAll({ outletId });
    }

    @Get('outlet/:outletId/product/:productId')
    @ApiOperation({ summary: 'Get specific stock record' })
    findOne(@Param('outletId') outletId: string, @Param('productId') productId: string) {
        return this.stockService.findOne(outletId, productId);
    }

    @Patch(':id')
    @RequirePermissions('manage_stock')
    @ApiOperation({ summary: 'Update stock record' })
    update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
        return this.stockService.update(id, updateStockDto);
    }

    @Post(':id/adjust')
    @RequirePermissions('manage_stock')
    @ApiOperation({ summary: 'Adjust stock quantity' })
    adjust(@Param('id') id: string, @Body() adjustStockDto: AdjustStockDto) {
        return this.stockService.adjust(id, adjustStockDto);
    }
}
