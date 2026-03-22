import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram Integration')
@Controller('integrations/telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService) { }

    @Post('webhook')
    @ApiOperation({ summary: 'Receive Telegram webhook updates for chat connection flow' })
    async handleWebhook(
        @Body() payload: any,
        @Headers('x-telegram-bot-api-secret-token') secret?: string,
    ) {
        return this.telegramService.handleWebhookUpdate(payload, secret);
    }
}
