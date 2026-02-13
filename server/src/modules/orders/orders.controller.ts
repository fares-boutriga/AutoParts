import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post()
    @RequirePermissions('sell_products')
    @ApiOperation({ summary: 'Create new order (POS)' })
    @ApiBody({ type: CreateOrderDto })
    create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
        return this.ordersService.create(createOrderDto, user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders' })
    @ApiQuery({ name: 'outletId', required: false })
    @ApiQuery({ name: 'cashierId', required: false })
    findAll(
        @Query('outletId') outletId?: string,
        @Query('cashierId') cashierId?: string,
    ) {
        return this.ordersService.findAll({ outletId, cashierId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order details' })
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }
}
