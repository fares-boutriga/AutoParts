import { OutletsService } from './outlets.service';

describe('OutletsService alert settings', () => {
    it('persists email and Telegram alert settings together', async () => {
        const prisma = {
            outlet: {
                update: jest.fn().mockResolvedValue({
                    id: 'outlet-1',
                    alertsEnabled: true,
                    email: 'admin@outlet.com',
                    telegramAlertsEnabled: true,
                    telegramChatId: '-1001234567890',
                }),
            },
        } as any;

        const service = new OutletsService(prisma);
        const result = await service.updateAlertSettings('outlet-1', {
            alertsEnabled: true,
            alertEmail: 'admin@outlet.com',
            telegramAlertsEnabled: true,
            telegramChatId: '-1001234567890',
        });

        expect(prisma.outlet.update).toHaveBeenCalledWith({
            where: { id: 'outlet-1' },
            data: {
                alertsEnabled: true,
                email: 'admin@outlet.com',
                telegramAlertsEnabled: true,
                telegramChatId: '-1001234567890',
            },
        });
        expect(result.telegramAlertsEnabled).toBe(true);
    });
});
