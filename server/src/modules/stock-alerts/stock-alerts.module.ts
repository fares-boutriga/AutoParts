import { Module } from '@nestjs/common';
import { StockAlertsService } from './stock-alerts.service';
import { StockAlertsController } from './stock-alerts.controller';
import { EmailModule } from '../email/email.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    imports: [EmailModule, TelegramModule],
    controllers: [StockAlertsController],
    providers: [StockAlertsService],
    exports: [StockAlertsService],
})
export class StockAlertsModule { }
