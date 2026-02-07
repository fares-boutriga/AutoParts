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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const stock_alerts_service_1 = require("../stock-alerts/stock-alerts.service");
let StockService = class StockService {
    prisma;
    stockAlertsService;
    constructor(prisma, stockAlertsService) {
        this.prisma = prisma;
        this.stockAlertsService = stockAlertsService;
    }
    async create(createStockDto) {
        const existing = await this.prisma.stock.findUnique({
            where: {
                productId_outletId: {
                    productId: createStockDto.productId,
                    outletId: createStockDto.outletId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Stock record already exists for this product at this outlet');
        }
        const stock = await this.prisma.stock.create({
            data: createStockDto,
            include: { product: true, outlet: true },
        });
        await this.stockAlertsService.checkStockAfterUpdate(stock.id);
        return stock;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.outletId)
            where.outletId = filters.outletId;
        if (filters?.productId)
            where.productId = filters.productId;
        return this.prisma.stock.findMany({
            where,
            include: {
                product: { include: { category: true } },
                outlet: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(outletId, productId) {
        const stock = await this.prisma.stock.findUnique({
            where: {
                productId_outletId: { productId, outletId },
            },
            include: { product: true, outlet: true },
        });
        if (!stock)
            throw new common_1.NotFoundException('Stock record not found');
        return stock;
    }
    async update(id, updateStockDto) {
        try {
            const stock = await this.prisma.stock.update({
                where: { id },
                data: updateStockDto,
                include: { product: true, outlet: true },
            });
            await this.stockAlertsService.checkStockAfterUpdate(stock.id);
            return stock;
        }
        catch {
            throw new common_1.NotFoundException('Stock record not found');
        }
    }
    async adjust(id, adjustStockDto) {
        const stock = await this.prisma.stock.findUnique({ where: { id } });
        if (!stock)
            throw new common_1.NotFoundException('Stock record not found');
        const newQuantity = stock.quantity + adjustStockDto.adjustment;
        if (newQuantity < 0) {
            throw new common_1.BadRequestException('Stock quantity cannot be negative');
        }
        const updated = await this.prisma.stock.update({
            where: { id },
            data: { quantity: newQuantity },
            include: { product: true, outlet: true },
        });
        await this.stockAlertsService.checkStockAfterUpdate(updated.id);
        return updated;
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_alerts_service_1.StockAlertsService])
], StockService);
//# sourceMappingURL=stock.service.js.map