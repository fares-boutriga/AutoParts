import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

    /**
     * Manual / admin-triggered full stock scan.
     * No longer runs on a cron schedule — stock alerts are triggered
     * automatically after each order via checkStockAfterUpdate().
     */
    async checkStockLevels() {
        console.log('[StockAlertsService] Running manual stock level check...');

        // Stocks using outlet-specific minimum
        const outletLowStocks = await this.prisma.stock.findMany({
            where: {
                minStockLevel: { not: null },
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
            },
            include: {
                product: true,
                outlet: true,
            },
        });

        const allLowStocks = outletLowStocks.filter(
            (s) => s.quantity < (s.minStockLevel ?? 0),
        );
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
            // Deduplication: skip if an unseen alert already exists for this product+outlet.
            // The user will receive a new notification only after they dismiss (mark as seen) the existing one.
            const existingUnseen = await this.prisma.notification.findFirst({
                where: {
                    type: 'STOCK_ALERT',
                    outletId,
                    productId,
                    seen: false,
                },
            });

            if (existingUnseen) {
                console.log(
                    `[StockAlertsService] Skipping duplicate in-app notification for ${productName} at ${outletName} (unseen alert already exists)`,
                );
                // Still update lastAlertAt so cooldown is respected for external channels
                await this.prisma.stock.update({
                    where: { id: stockId },
                    data: { lastAlertAt: new Date() },
                });
                return;
            }

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
