import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockAlertsModule } from '../stock-alerts/stock-alerts.module';

@Module({
    imports: [StockAlertsModule],
    controllers: [StockController],
    providers: [StockService],
    exports: [StockService],
})
export class StockModule { }
