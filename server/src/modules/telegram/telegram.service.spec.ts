import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { TelegramService } from './telegram.service';

describe('TelegramService', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        jest.restoreAllMocks();
        global.fetch = originalFetch;
    });

    const createService = (overrides?: Record<string, string>) => {
        const baseConfig: Record<string, string> = {
            TELEGRAM_ENABLED: 'true',
            TELEGRAM_BOT_TOKEN: 'bot-token',
            TELEGRAM_BOT_USERNAME: 'autoparts_bot',
            TELEGRAM_TEST_MODE: 'false',
            TELEGRAM_CONNECT_TOKEN_TTL_MINUTES: '10',
        };

        const configData = { ...baseConfig, ...(overrides || {}) };
        const configService = {
            get: jest.fn((key: string) => configData[key]),
        } as unknown as ConfigService;

        const prisma = {
            outlet: {
                findUnique: jest.fn(),
                update: jest.fn().mockResolvedValue({}),
            },
            telegramConnectionToken: {
                create: jest.fn().mockResolvedValue({}),
                findUnique: jest.fn(),
                update: jest.fn().mockResolvedValue({}),
            },
            $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
        } as any;

        const service = new TelegramService(configService, prisma);
        return { service, prisma, configService };
    };

    it('sends stock alert successfully', async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true, result: { message_id: 101 } }),
        });
        global.fetch = fetchMock as any;

        const { service } = createService();
        const result = await service.sendStockAlert({
            recipientChatId: '-1001234567890',
            productName: 'Filtre huile',
            currentQuantity: 2,
            minStockLevel: 5,
            outletName: 'Main Store',
        });

        expect(result.success).toBe(true);
        expect(result.messageId).toBe(101);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('skips stock alert send when channel is disabled', async () => {
        const { service } = createService({ TELEGRAM_ENABLED: 'false' });
        const result = await service.sendStockAlert({
            recipientChatId: '-1001234567890',
            productName: 'Filtre huile',
            currentQuantity: 2,
            minStockLevel: 5,
            outletName: 'Main Store',
        });

        expect(result.success).toBe(false);
        expect(result.skipped).toBe(true);
        expect(result.error).toBe('telegram_channel_disabled');
    });

    it('generates a one-time connection deep link', async () => {
        const { service, prisma } = createService();
        prisma.outlet.findUnique.mockResolvedValue({ id: 'outlet-1' });

        const result = await service.initConnection('outlet-1', 'user-1', 'group');

        expect(result.targetType).toBe('group');
        expect(result.connectUrl).toContain('https://t.me/autoparts_bot?startgroup=');
        expect(prisma.telegramConnectionToken.create).toHaveBeenCalledTimes(1);

        const createArg = prisma.telegramConnectionToken.create.mock.calls[0][0];
        expect(createArg.data.outletId).toBe('outlet-1');
        expect(createArg.data.userId).toBe('user-1');
        expect(createArg.data.targetType).toBe('group');
        expect(typeof createArg.data.tokenHash).toBe('string');
        expect(createArg.data.tokenHash.length).toBe(64);
    });

    it('connects outlet via webhook when token is valid', async () => {
        const { service, prisma } = createService();
        const rawToken = 'abcdefghijklmnopqrstuvwx123456';
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        prisma.telegramConnectionToken.findUnique.mockResolvedValue({
            id: 'token-1',
            outletId: 'outlet-1',
            targetType: 'group',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            consumedAt: null,
        });

        const result = await service.handleWebhookUpdate({
            message: {
                text: `/start ${rawToken}`,
                chat: {
                    id: -1001234567890,
                    type: 'supergroup',
                    title: 'Magasin Principal',
                },
            },
        });

        expect(result.ok).toBe(true);
        expect(result.processed).toBe(true);
        expect(prisma.telegramConnectionToken.findUnique).toHaveBeenCalledWith({
            where: { tokenHash },
        });
        expect(prisma.outlet.update).toHaveBeenCalledTimes(1);
        expect(prisma.telegramConnectionToken.update).toHaveBeenCalledTimes(1);
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('rejects webhook connection when target type mismatches', async () => {
        const { service, prisma } = createService();
        const rawToken = 'abcdefghijklmnopqrstuvwx123456';

        prisma.telegramConnectionToken.findUnique.mockResolvedValue({
            id: 'token-1',
            outletId: 'outlet-1',
            targetType: 'private',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            consumedAt: null,
        });

        const result = await service.handleWebhookUpdate({
            message: {
                text: `/start ${rawToken}`,
                chat: {
                    id: -1001234567890,
                    type: 'supergroup',
                    title: 'Magasin Principal',
                },
            },
        });

        expect(result.ok).toBe(true);
        expect(result.processed).toBe(false);
        expect(result.reason).toBe('target_type_mismatch');
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns connected status from outlet metadata', async () => {
        const { service, prisma } = createService();
        prisma.outlet.findUnique.mockResolvedValue({
            telegramChatId: '-1001234567890',
            telegramChatType: 'supergroup',
            telegramChatTitle: 'Magasin Principal',
            telegramConnectedAt: new Date('2026-03-22T10:00:00.000Z'),
        });

        const status = await service.getConnectionStatus('outlet-1');
        expect(status.connected).toBe(true);
        expect(status.chatType).toBe('supergroup');
        expect(status.chatTitle).toBe('Magasin Principal');
    });

    it('disconnects outlet telegram binding', async () => {
        const { service, prisma } = createService();
        await service.disconnectOutlet('outlet-1');

        expect(prisma.outlet.update).toHaveBeenCalledWith({
            where: { id: 'outlet-1' },
            data: {
                telegramChatId: null,
                telegramChatType: null,
                telegramChatTitle: null,
                telegramConnectedAt: null,
            },
        });
    });

    it('rejects webhook when secret header is invalid', async () => {
        const { service } = createService({ TELEGRAM_WEBHOOK_SECRET: 'expected-secret' });

        await expect(
            service.handleWebhookUpdate({ message: {} }, 'wrong-secret'),
        ).rejects.toThrow('Invalid Telegram webhook secret');
    });
});
