import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class StockAlertsService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) { }

    // Backup cron job for periodic stock checks
    @Cron('*/5 * * * *') // Every 5 minutes (configurable via env)
    async checkStockLevels() {
        console.log('🔍 Running stock level check...');

        const cooldownHours = this.configService.get<number>(
            'STOCK_ALERT_COOLDOWN_HOURS',
            24,
        );

        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);

        // Find stocks below minimum level that haven't been alerted recently
        const lowStocks = await this.prisma.stock.findMany({
            where: {
                OR: [
                    // Stock below outlet-specific minimum
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

        // Also check stocks using global minimum
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

        // Filter global stocks where quantity is below product minimum
        for (const stock of globalLowStocks) {
            if (stock.quantity < stock.product.minStockLevel) {
                allLowStocks.push(stock);
            }
        }

        console.log(`Found ${allLowStocks.length} low stock items`);

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

        // Check if below minimum
        if (stock.quantity >= effectiveMinLevel) return;

        // Check cooldown
        const cooldownHours = this.configService.get<number>(
            'STOCK_ALERT_COOLDOWN_HOURS',
            24,
        );
        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);

        if (stock.lastAlertAt && stock.lastAlertAt > cooldownDate) {
            console.log(`⏳ Skipping alert for ${stock.product.name} (cooldown active)`);
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
        );
    }

    /**
     * Create stock alert notification and send email
     * This method is public so it can be called from OrdersService
     * Notification creation is synchronous (for transaction safety)
     * Email sending is asynchronous (fire and forget)
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
    ) {
        try {
            // Create in-app notification (synchronous - part of transaction)
            await this.prisma.notification.create({
                data: {
                    type: 'STOCK_ALERT',
                    message: `Low stock alert: ${productName} at ${outletName}. Current: ${currentQuantity}, Minimum: ${minStockLevel}`,
                    outletId,
                    productId,
                    seen: false,
                },
            });

            console.log(`📢 Created in-app notification for ${productName}`);

            // Send email asynchronously (fire and forget - not part of transaction)
            if (alertsEnabled && outletEmail) {
                // Don't await - let it run in background
                this.emailService.sendStockAlert(
                    outletEmail,
                    productName,
                    currentQuantity,
                    minStockLevel,
                    outletName,
                ).catch((error) => {
                    console.error(`❌ Failed to send email alert:`, error);
                });
            }

            // Update last alert timestamp
            await this.prisma.stock.update({
                where: { id: stockId },
                data: { lastAlertAt: new Date() },
            });

            console.log(`✅ Stock alert processed for ${productName}`);
        } catch (error) {
            console.error(`❌ Failed to create stock alert:`, error);
            throw error; // Re-throw to allow transaction rollback
        }
    }
}
