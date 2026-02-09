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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { GetLowStockQueryDto } from './dto/get-low-stock-query.dto';
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
    @ApiBody({ type: CreateStockDto })
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

    @Get('low')
    @ApiOperation({
        summary: 'Get low stock items for an outlet',
        description: 'Returns all stock items where quantity is below the minimum stock level. Uses outlet-specific minimum if set, otherwise uses product-level minimum. Useful for dashboard alerts and inventory management.'
    })
    @ApiQuery({
        name: 'outletId',
        required: true,
        description: 'Outlet ID to check low stock for',
        example: 'uuid-here',
        type: String
    })
    @ApiQuery({
        name: 'threshold',
        required: false,
        description: 'Optional threshold override for low stock level',
        example: 5,
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'List of low stock items',
        schema: {
            example: [{
                id: 'stock-uuid',
                productId: 'product-uuid',
                outletId: 'outlet-uuid',
                quantity: 3,
                minStockLevel: 10,
                lastAlertAt: '2024-01-01T00:00:00.000Z',
                product: {
                    id: 'product-uuid',
                    name: 'Brake Pad',
                    reference: 'BP-001',
                    minStockLevel: 10,
                    category: {
                        id: 'category-uuid',
                        name: 'Brake System'
                    }
                },
                outlet: {
                    id: 'outlet-uuid',
                    name: 'Main Store',
                    alertsEnabled: true,
                    email: 'admin@outlet.com'
                }
            }]
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid query parameters'
    })
    findLowStock(@Query() query: GetLowStockQueryDto) {
        return this.stockService.findLowStock(query.outletId, query.threshold);
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
    @ApiBody({ type: UpdateStockDto })
    update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
        return this.stockService.update(id, updateStockDto);
    }

    @Post(':id/adjust')
    @RequirePermissions('manage_stock')
    @ApiOperation({ summary: 'Adjust stock quantity' })
    @ApiBody({ type: AdjustStockDto })
    adjust(@Param('id') id: string, @Body() adjustStockDto: AdjustStockDto) {
        return this.stockService.adjust(id, adjustStockDto);
    }
}
