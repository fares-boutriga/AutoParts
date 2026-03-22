import { ConfigService } from '@nestjs/config';
import { StockAlertsService } from './stock-alerts.service';

describe('StockAlertsService channel routing', () => {
    const createService = () => {
        const prisma = {
            notification: {
                create: jest.fn().mockResolvedValue({ id: 'n1' }),
            },
            stock: {
                update: jest.fn().mockResolvedValue({ id: 's1' }),
            },
        } as any;

        const emailService = {
            sendStockAlert: jest.fn().mockResolvedValue({ success: true }),
        } as any;

        const telegramService = {
            sendStockAlert: jest.fn().mockResolvedValue({ success: true }),
        } as any;

        const configService = {
            get: jest.fn(),
        } as unknown as ConfigService;

        const service = new StockAlertsService(
            prisma,
            emailService,
            telegramService,
            configService,
        );

        return { service, prisma, emailService, telegramService };
    };

    it('sends email only when email channel is available and Telegram disabled', async () => {
        const { service, emailService, telegramService } = createService();

        await service.createStockAlert(
            'stock-id',
            'Produit A',
            3,
            10,
            'Outlet A',
            'outlet-id',
            'product-id',
            'admin@outlet.com',
            true,
            '-1001234567890',
            false,
        );

        expect(emailService.sendStockAlert).toHaveBeenCalledTimes(1);
        expect(telegramService.sendStockAlert).not.toHaveBeenCalled();
    });

    it('sends Telegram only when email is absent and Telegram enabled', async () => {
        const { service, emailService, telegramService } = createService();

        await service.createStockAlert(
            'stock-id',
            'Produit A',
            3,
            10,
            'Outlet A',
            'outlet-id',
            'product-id',
            null,
            true,
            '-1001234567890',
            true,
        );

        expect(emailService.sendStockAlert).not.toHaveBeenCalled();
        expect(telegramService.sendStockAlert).toHaveBeenCalledTimes(1);
    });

    it('sends both channels when both are enabled and available', async () => {
        const { service, emailService, telegramService } = createService();

        await service.createStockAlert(
            'stock-id',
            'Produit A',
            3,
            10,
            'Outlet A',
            'outlet-id',
            'product-id',
            'admin@outlet.com',
            true,
            '-1001234567890',
            true,
        );

        expect(emailService.sendStockAlert).toHaveBeenCalledTimes(1);
        expect(telegramService.sendStockAlert).toHaveBeenCalledTimes(1);
    });

    it('does not send Telegram when Telegram is enabled but outlet is not connected', async () => {
        const { service, emailService, telegramService } = createService();

        await service.createStockAlert(
            'stock-id',
            'Produit A',
            3,
            10,
            'Outlet A',
            'outlet-id',
            'product-id',
            'admin@outlet.com',
            true,
            null,
            true,
        );

        expect(emailService.sendStockAlert).toHaveBeenCalledTimes(1);
        expect(telegramService.sendStockAlert).not.toHaveBeenCalled();
    });

    it('sends neither channel when alerts are globally disabled', async () => {
        const { service, emailService, telegramService, prisma } = createService();

        await service.createStockAlert(
            'stock-id',
            'Produit A',
            3,
            10,
            'Outlet A',
            'outlet-id',
            'product-id',
            'admin@outlet.com',
            false,
            '-1001234567890',
            true,
        );

        expect(emailService.sendStockAlert).not.toHaveBeenCalled();
        expect(telegramService.sendStockAlert).not.toHaveBeenCalled();
        expect(prisma.notification.create).toHaveBeenCalledTimes(1);
        expect(prisma.stock.update).toHaveBeenCalledTimes(1);
    });
});
