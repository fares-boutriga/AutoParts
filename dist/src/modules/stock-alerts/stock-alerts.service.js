"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAlertsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let StockAlertsService = class StockAlertsService {
    prisma;
    emailService;
    configService;
    constructor(prisma, emailService, configService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
    }
    async checkStockLevels() {
        console.log('🔍 Running stock level check...');
        const cooldownHours = this.configService.get('STOCK_ALERT_COOLDOWN_HOURS', 24);
        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);
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
        console.log(`Found ${allLowStocks.length} low stock items`);
        for (const stock of allLowStocks) {
            await this.createStockAlert(stock.id, stock.product.name, stock.quantity, stock.minStockLevel ?? stock.product.minStockLevel, stock.outlet.name, stock.outletId, stock.productId, stock.outlet.email, stock.outlet.alertsEnabled);
        }
    }
    async checkStockAfterUpdate(stockId) {
        const stock = await this.prisma.stock.findUnique({
            where: { id: stockId },
            include: {
                product: true,
                outlet: true,
            },
        });
        if (!stock)
            return;
        const effectiveMinLevel = stock.minStockLevel ?? stock.product.minStockLevel;
        if (stock.quantity >= effectiveMinLevel)
            return;
        const cooldownHours = this.configService.get('STOCK_ALERT_COOLDOWN_HOURS', 24);
        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);
        if (stock.lastAlertAt && stock.lastAlertAt > cooldownDate) {
            console.log(`⏳ Skipping alert for ${stock.product.name} (cooldown active)`);
            return;
        }
        await this.createStockAlert(stock.id, stock.product.name, stock.quantity, effectiveMinLevel, stock.outlet.name, stock.outletId, stock.productId, stock.outlet.email, stock.outlet.alertsEnabled);
    }
    async createStockAlert(stockId, productName, currentQuantity, minStockLevel, outletName, outletId, productId, outletEmail, alertsEnabled) {
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
            console.log(`📢 Created in-app notification for ${productName}`);
            if (alertsEnabled && outletEmail) {
                await this.emailService.sendStockAlert(outletEmail, productName, currentQuantity, minStockLevel, outletName);
            }
            await this.prisma.stock.update({
                where: { id: stockId },
                data: { lastAlertAt: new Date() },
            });
            console.log(`✅ Stock alert processed for ${productName}`);
        }
        catch (error) {
            console.error(`❌ Failed to create stock alert:`, error);
        }
    }
};
exports.StockAlertsService = StockAlertsService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockAlertsService.prototype, "checkStockLevels", null);
exports.StockAlertsService = StockAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], StockAlertsService);
//# sourceMappingURL=stock-alerts.service.js.map