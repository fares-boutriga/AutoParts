import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StockModule } from '../stock/stock.module';
import { StockAlertsModule } from '../stock-alerts/stock-alerts.module';

@Module({
    imports: [StockModule, StockAlertsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
