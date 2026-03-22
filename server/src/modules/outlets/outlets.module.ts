import { Module } from '@nestjs/common';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    imports: [TelegramModule],
    controllers: [OutletsController],
    providers: [OutletsService],
    exports: [OutletsService],
})
export class OutletsModule { }
