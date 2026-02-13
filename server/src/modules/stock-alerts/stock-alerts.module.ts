import { Module } from '@nestjs/common';
import { StockAlertsService } from './stock-alerts.service';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule],
    providers: [StockAlertsService],
    exports: [StockAlertsService],
})
export class StockAlertsModule { }
