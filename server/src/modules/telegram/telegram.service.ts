import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash, randomBytes } from 'crypto';

type TelegramStockAlertPayload = {
    recipientChatId: string;
    productName: string;
    currentQuantity: number;
    minStockLevel: number;
    outletName: string;
};

type TelegramSendResult = {
    success: boolean;
    skipped?: boolean;
    error?: string;
    messageId?: number;
};

type TelegramConnectionTargetType = 'group' | 'private';

type TelegramConnectionInitResult = {
    connectUrl: string;
    targetType: TelegramConnectionTargetType;
    expiresAt: string;
};

type TelegramConnectionStatusResult = {
    connected: boolean;
    chatId: string | null;
    chatType: string | null;
    chatTitle: string | null;
    connectedAt: string | null;
};

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    async sendStockAlert(payload: TelegramStockAlertPayload): Promise<TelegramSendResult> {
        if (!this.isEnabled()) {
            this.logger.debug('Telegram channel disabled via config; skipping stock alert send');
            return { success: false, skipped: true, error: 'telegram_channel_disabled' };
        }

        const config = this.getTelegramConfig();
        if (!config) {
            this.logger.warn('Missing Telegram config; skipping stock alert send');
            return { success: false, skipped: true, error: 'missing_telegram_config' };
        }

        if (!this.isValidChatId(payload.recipientChatId)) {
            this.logger.warn(
                `Invalid Telegram chat ID; skipping send (${this.maskChatId(payload.recipientChatId)})`,
            );
            return { success: false, skipped: true, error: 'invalid_telegram_chat_id' };
        }

        const finalChatId = this.resolveRecipient(payload.recipientChatId);
        if (!this.isValidChatId(finalChatId)) {
            this.logger.warn(
                `Invalid Telegram final chat ID; skipping send (${this.maskChatId(finalChatId)})`,
            );
            return { success: false, skipped: true, error: 'invalid_telegram_chat_id' };
        }

        const requestBody = {
            chat_id: finalChatId,
            text: this.buildStockAlertMessage(payload),
            disable_web_page_preview: true,
        };

        const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json().catch(() => ({}));
            if (!response.ok || responseData?.ok === false) {
                const error = responseData?.description || `HTTP ${response.status}`;
                this.logger.error(
                    `Telegram stock alert send failed: ${JSON.stringify({
                        status: response.status,
                        error,
                        chatId: this.maskChatId(finalChatId),
                        outletName: payload.outletName,
                        productName: payload.productName,
                    })}`,
                );
                return { success: false, error };
            }

            const messageId = responseData?.result?.message_id as number | undefined;
            this.logger.log(
                `Telegram stock alert sent: ${JSON.stringify({
                    chatId: this.maskChatId(finalChatId),
                    outletName: payload.outletName,
                    productName: payload.productName,
                    messageId: messageId ?? null,
                })}`,
            );

            return { success: true, messageId };
        } catch (error: any) {
            const message = error?.message || 'unknown_error';
            this.logger.error(
                `Telegram stock alert request error: ${JSON.stringify({
                    error: message,
                    chatId: this.maskChatId(finalChatId),
                    outletName: payload.outletName,
                    productName: payload.productName,
                })}`,
            );
            return { success: false, error: message };
        }
    }

    async initConnection(
        outletId: string,
        userId: string,
        targetType: TelegramConnectionTargetType,
    ): Promise<TelegramConnectionInitResult> {
        const outlet = await this.prisma.outlet.findUnique({
            where: { id: outletId },
            select: { id: true },
        });
        if (!outlet) {
            throw new NotFoundException('Outlet not found');
        }

        const botUsername = this.getBotUsername();
        const ttlMinutes = this.getConnectionTokenTtlMinutes();
        const rawToken = randomBytes(24).toString('base64url');
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

        await this.prisma.telegramConnectionToken.create({
            data: {
                tokenHash,
                outletId,
                userId,
                targetType,
                expiresAt,
            },
        });

        const deepLinkKey = targetType === 'group' ? 'startgroup' : 'start';
        const connectUrl = `https://t.me/${botUsername}?${deepLinkKey}=${rawToken}`;

        this.logger.log(
            `Telegram connection link generated: ${JSON.stringify({
                outletId,
                userId,
                targetType,
                expiresAt: expiresAt.toISOString(),
            })}`,
        );

        return {
            connectUrl,
            targetType,
            expiresAt: expiresAt.toISOString(),
        };
    }

    async getConnectionStatus(outletId: string): Promise<TelegramConnectionStatusResult> {
        const outlet = await this.prisma.outlet.findUnique({
            where: { id: outletId },
            select: {
                telegramChatId: true,
                telegramChatType: true,
                telegramChatTitle: true,
                telegramConnectedAt: true,
            },
        });
        if (!outlet) {
            throw new NotFoundException('Outlet not found');
        }

        return {
            connected: Boolean(outlet.telegramChatId),
            chatId: outlet.telegramChatId ?? null,
            chatType: outlet.telegramChatType ?? null,
            chatTitle: outlet.telegramChatTitle ?? null,
            connectedAt: outlet.telegramConnectedAt
                ? outlet.telegramConnectedAt.toISOString()
                : null,
        };
    }

    async disconnectOutlet(outletId: string): Promise<{ success: true }> {
        try {
            await this.prisma.outlet.update({
                where: { id: outletId },
                data: {
                    telegramChatId: null,
                    telegramChatType: null,
                    telegramChatTitle: null,
                    telegramConnectedAt: null,
                },
            });
        } catch (error) {
            throw new NotFoundException('Outlet not found');
        }

        this.logger.log(`Telegram connection disconnected for outlet ${outletId}`);
        return { success: true };
    }

    async handleWebhookUpdate(
        update: any,
        secretHeader?: string,
    ): Promise<{ ok: true; processed: boolean; reason?: string }> {
        this.validateWebhookSecret(secretHeader);

        const message = update?.message ?? update?.edited_message;
        const chat = message?.chat;
        const token = this.extractConnectionToken(message?.text);

        if (!chat || !token) {
            return { ok: true, processed: false, reason: 'ignored_update' };
        }

        const tokenRecord = await this.prisma.telegramConnectionToken.findUnique({
            where: { tokenHash: this.hashToken(token) },
        });

        if (!tokenRecord) {
            return { ok: true, processed: false, reason: 'token_not_found' };
        }

        if (tokenRecord.consumedAt) {
            return { ok: true, processed: false, reason: 'token_already_consumed' };
        }

        if (tokenRecord.expiresAt.getTime() < Date.now()) {
            return { ok: true, processed: false, reason: 'token_expired' };
        }

        const chatType = String(chat.type || '').toLowerCase();
        if (!this.isTargetTypeCompatible(tokenRecord.targetType, chatType)) {
            this.logger.warn(
                `Telegram connection target mismatch: ${JSON.stringify({
                    targetType: tokenRecord.targetType,
                    actualChatType: chatType,
                    outletId: tokenRecord.outletId,
                })}`,
            );
            return { ok: true, processed: false, reason: 'target_type_mismatch' };
        }

        const telegramChatId = String(chat.id);
        const telegramChatTitle = this.resolveChatTitle(chat);
        const now = new Date();

        await this.prisma.$transaction([
            this.prisma.outlet.update({
                where: { id: tokenRecord.outletId },
                data: {
                    telegramChatId,
                    telegramChatType: chatType,
                    telegramChatTitle,
                    telegramConnectedAt: now,
                },
            }),
            this.prisma.telegramConnectionToken.update({
                where: { id: tokenRecord.id },
                data: { consumedAt: now },
            }),
        ]);

        this.logger.log(
            `Telegram outlet connected: ${JSON.stringify({
                outletId: tokenRecord.outletId,
                chatId: this.maskChatId(telegramChatId),
                chatType,
                chatTitle: telegramChatTitle || null,
            })}`,
        );

        return { ok: true, processed: true };
    }

    private validateWebhookSecret(secretHeader?: string) {
        const expected = this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET')?.trim();
        if (!expected) return;

        if (!secretHeader || secretHeader !== expected) {
            throw new UnauthorizedException('Invalid Telegram webhook secret');
        }
    }

    private extractConnectionToken(textValue: any): string | null {
        if (typeof textValue !== 'string') return null;
        const text = textValue.trim();
        if (!text) return null;

        const commandMatch = text.match(/^\/(?:start|startgroup)(?:@\w+)?\s+([A-Za-z0-9_-]{20,})$/i);
        if (commandMatch?.[1]) {
            return commandMatch[1];
        }

        const plainMatch = text.match(/^([A-Za-z0-9_-]{20,})$/);
        if (plainMatch?.[1]) {
            return plainMatch[1];
        }

        return null;
    }

    private isTargetTypeCompatible(targetType: string, chatType: string): boolean {
        if (targetType === 'private') {
            return chatType === 'private';
        }
        if (targetType === 'group') {
            return chatType === 'group' || chatType === 'supergroup';
        }
        return false;
    }

    private resolveChatTitle(chat: any): string | null {
        if (!chat) return null;

        if (chat.type === 'private') {
            const display = [chat.first_name, chat.last_name].filter(Boolean).join(' ').trim();
            if (display) return display;
            if (chat.username) return `@${chat.username}`;
            return null;
        }

        if (chat.title) return String(chat.title);
        if (chat.username) return `@${chat.username}`;
        return null;
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private getConnectionTokenTtlMinutes(): number {
        const raw = this.configService.get<string>('TELEGRAM_CONNECT_TOKEN_TTL_MINUTES');
        const parsed = Number(raw);
        if (!Number.isFinite(parsed) || parsed <= 0) return 10;
        return Math.floor(parsed);
    }

    private getBotUsername(): string {
        const value = this.configService.get<string>('TELEGRAM_BOT_USERNAME')?.trim();
        if (!value) {
            throw new BadRequestException('TELEGRAM_BOT_USERNAME is required for Telegram connection flow');
        }
        return value.replace(/^@/, '');
    }

    private buildStockAlertMessage(payload: TelegramStockAlertPayload): string {
        return [
            'Alerte stock faible',
            `Produit: ${payload.productName}`,
            `Quantite actuelle: ${payload.currentQuantity}`,
            `Seuil minimum: ${payload.minStockLevel}`,
            `Point de vente: ${payload.outletName}`,
        ].join('\n');
    }

    private isEnabled(): boolean {
        return this.parseBoolean(this.configService.get<string>('TELEGRAM_ENABLED'), false);
    }

    private resolveRecipient(outletRecipient: string): string {
        const isTestMode = this.parseBoolean(this.configService.get<string>('TELEGRAM_TEST_MODE'), false);
        if (!isTestMode) return outletRecipient;

        const testRecipient = this.configService.get<string>('TELEGRAM_TEST_CHAT_ID')?.trim();
        if (!testRecipient) {
            this.logger.warn('TELEGRAM_TEST_MODE is true but TELEGRAM_TEST_CHAT_ID is empty');
            return outletRecipient;
        }
        return testRecipient;
    }

    private getTelegramConfig():
        | {
            botToken: string;
        }
        | null {
        const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN')?.trim();
        if (!botToken) return null;

        return {
            botToken,
        };
    }

    private parseBoolean(value: string | undefined, fallback: boolean): boolean {
        if (!value) return fallback;
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
        return fallback;
    }

    private isValidChatId(value: string): boolean {
        return /^-?\d+$/.test(value.trim());
    }

    private maskChatId(value: string): string {
        const trimmed = value.trim();
        if (trimmed.length <= 6) return trimmed;
        return `${trimmed.slice(0, 3)}***${trimmed.slice(-3)}`;
    }
}
