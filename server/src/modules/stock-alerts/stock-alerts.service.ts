import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class StockAlertsService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private telegramService: TelegramService,
        private configService: ConfigService,
    ) { }

    // Backup cron job for periodic stock checks
    @Cron('*/5 * * * *') // Every 5 minutes
    async checkStockLevels() {
        console.log('[StockAlertsService] Running stock level check...');

        const cooldownHours = this.configService.get<number>(
            'STOCK_ALERT_COOLDOWN_HOURS',
            24,
        );

        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);

        // Find stocks below outlet-specific minimum and not alerted recently
        const lowStocks = await this.prisma.stock.findMany({
            where: {
                OR: [
                    {
                        minStockLevel: { not: null },
                        quantity: { lt: this.prisma.stock.fields.minStockLevel },
                        OR: [
                            { lastAlertAt: null },
                            { lastAlertAt: { lt: cooldownDate } },
                        ],
                    },
                ],
            },
            include: {
                product: true,
                outlet: true,
            },
        });

        // Stocks using product global minimum
        const globalLowStocks = await this.prisma.stock.findMany({
            where: {
                minStockLevel: null,
                product: {
                    minStockLevel: { gt: 0 },
                },
                OR: [{ lastAlertAt: null }, { lastAlertAt: { lt: cooldownDate } }],
            },
            include: {
                product: true,
                outlet: true,
            },
        });

        const allLowStocks = [...lowStocks];
        for (const stock of globalLowStocks) {
            if (stock.quantity < stock.product.minStockLevel) {
                allLowStocks.push(stock);
            }
        }

        console.log(`[StockAlertsService] Found ${allLowStocks.length} low stock items`);

        for (const stock of allLowStocks) {
            await this.createStockAlert(
                stock.id,
                stock.product.name,
                stock.quantity,
                stock.minStockLevel ?? stock.product.minStockLevel,
                stock.outlet.name,
                stock.outletId,
                stock.productId,
                stock.outlet.email,
                stock.outlet.alertsEnabled,
                (stock.outlet as any).telegramChatId ?? null,
                Boolean((stock.outlet as any).telegramAlertsEnabled),
            );
        }
    }

    // Called immediately after stock updates (primary trigger)
    async checkStockAfterUpdate(stockId: string) {
        const stock = await this.prisma.stock.findUnique({
            where: { id: stockId },
            include: {
                product: true,
                outlet: true,
            },
        });

        if (!stock) return;

        const effectiveMinLevel = stock.minStockLevel ?? stock.product.minStockLevel;
        if (stock.quantity >= effectiveMinLevel) return;

        const cooldownHours = this.configService.get<number>(
            'STOCK_ALERT_COOLDOWN_HOURS',
            24,
        );
        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);

        if (stock.lastAlertAt && stock.lastAlertAt > cooldownDate) {
            console.log(`[StockAlertsService] Skipping alert for ${stock.product.name} (cooldown active)`);
            return;
        }

        await this.createStockAlert(
            stock.id,
            stock.product.name,
            stock.quantity,
            effectiveMinLevel,
            stock.outlet.name,
            stock.outletId,
            stock.productId,
            stock.outlet.email,
            stock.outlet.alertsEnabled,
            (stock.outlet as any).telegramChatId ?? null,
            Boolean((stock.outlet as any).telegramAlertsEnabled),
        );
    }

    /**
     * Create stock alert notification and send alert channels.
     * Notification creation is synchronous (transaction-safe).
     * Channel delivery is async fire-and-forget.
     */
    async createStockAlert(
        stockId: string,
        productName: string,
        currentQuantity: number,
        minStockLevel: number,
        outletName: string,
        outletId: string,
        productId: string,
        outletEmail: string | null,
        alertsEnabled: boolean,
        outletTelegramChatId: string | null,
        telegramAlertsEnabled: boolean,
    ) {
        try {
            await this.prisma.notification.create({
                data: {
                    type: 'STOCK_ALERT',
                    message: `Low stock alert: ${productName} at ${outletName}. Current: ${currentQuantity}, Minimum: ${minStockLevel}`,
                    outletId,
                    productId,
                    seen: false,
                },
            });

            if (alertsEnabled && outletEmail) {
                this.emailService
                    .sendStockAlert(
                        outletEmail,
                        productName,
                        currentQuantity,
                        minStockLevel,
                        outletName,
                    )
                    .catch((error) => {
                        console.error('[StockAlertsService] Failed to send email alert:', error);
                    });
            }

            if (alertsEnabled && telegramAlertsEnabled && outletTelegramChatId) {
                this.telegramService
                    .sendStockAlert({
                        recipientChatId: outletTelegramChatId,
                        productName,
                        currentQuantity,
                        minStockLevel,
                        outletName,
                    })
                    .catch((error) => {
                        console.error('[StockAlertsService] Failed to send Telegram alert:', error);
                    });
            } else if (alertsEnabled && telegramAlertsEnabled && !outletTelegramChatId) {
                console.warn(
                    `[StockAlertsService] Telegram alerts enabled but outlet has no connected Telegram chat (${outletId})`,
                );
            }

            await this.prisma.stock.update({
                where: { id: stockId },
                data: { lastAlertAt: new Date() },
            });
        } catch (error) {
            console.error('[StockAlertsService] Failed to create stock alert:', error);
            throw error;
        }
    }
}
