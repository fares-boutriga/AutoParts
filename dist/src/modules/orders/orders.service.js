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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const stock_service_1 = require("../stock/stock.service");
let OrdersService = class OrdersService {
    prisma;
    stockService;
    constructor(prisma, stockService) {
        this.prisma = prisma;
        this.stockService = stockService;
    }
    async create(createOrderDto, cashierId) {
        const { items, ...orderData } = createOrderDto;
        for (const item of items) {
            const stock = await this.prisma.stock.findUnique({
                where: {
                    productId_outletId: {
                        productId: item.productId,
                        outletId: orderData.outletId,
                    },
                },
                include: { product: true },
            });
            if (!stock) {
                throw new common_1.BadRequestException(`Product ${item.productId} not found at this outlet`);
            }
            if (stock.quantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for product ${stock.product.name}. Available: ${stock.quantity}, Requested: ${item.quantity}`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    outletId: orderData.outletId,
                    cashierId: cashierId,
                    customerId: orderData.customerId,
                    paymentMethod: orderData.paymentMethod,
                    totalAmount: createOrderDto.totalAmount,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            subtotal: item.subtotal,
                        })),
                    },
                },
                include: {
                    items: { include: { product: true } },
                    outlet: true,
                    cashier: { select: { id: true, name: true } },
                    customer: true,
                },
            });
            for (const item of items) {
                const stock = await tx.stock.findUnique({
                    where: {
                        productId_outletId: {
                            productId: item.productId,
                            outletId: orderData.outletId,
                        },
                    },
                });
                if (stock) {
                    await tx.stock.update({
                        where: { id: stock.id },
                        data: { quantity: { decrement: item.quantity } },
                    });
                }
            }
            return order;
        }).then(async (order) => {
            for (const item of order.items) {
                const stock = await this.prisma.stock.findUnique({
                    where: { productId_outletId: { productId: item.productId, outletId: order.outletId } }
                });
                if (stock) {
                    await this.stockService.adjust(stock.id, { adjustment: 0, reason: 'Alert Check' });
                }
            }
            return order;
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.outletId)
            where.outletId = filters.outletId;
        if (filters?.cashierId)
            where.cashierId = filters.cashierId;
        return this.prisma.order.findMany({
            where,
            include: {
                outlet: true,
                cashier: { select: { id: true, name: true } },
                customer: true,
                _count: { select: { items: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                outlet: true,
                cashier: { select: { id: true, name: true } },
                customer: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map