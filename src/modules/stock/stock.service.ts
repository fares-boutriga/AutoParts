import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockAlertsService } from '../stock-alerts/stock-alerts.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class StockService {
    constructor(
        private prisma: PrismaService,
        private stockAlertsService: StockAlertsService,
    ) { }

    async create(createStockDto: CreateStockDto) {
        // Check for existing stock
        const existing = await this.prisma.stock.findUnique({
            where: {
                productId_outletId: {
                    productId: createStockDto.productId,
                    outletId: createStockDto.outletId,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Stock record already exists for this product at this outlet');
        }

        const stock = await this.prisma.stock.create({
            data: createStockDto,
            include: { product: true, outlet: true },
        });

        // Initial alert check
        await this.stockAlertsService.checkStockAfterUpdate(stock.id);

        return stock;
    }

    async findAll(filters?: { outletId?: string; productId?: string }) {
        const where: any = {};
        if (filters?.outletId) where.outletId = filters.outletId;
        if (filters?.productId) where.productId = filters.productId;

        return this.prisma.stock.findMany({
            where,
            include: {
                product: { include: { category: true } },
                outlet: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(outletId: string, productId: string) {
        const stock = await this.prisma.stock.findUnique({
            where: {
                productId_outletId: { productId, outletId },
            },
            include: { product: true, outlet: true },
        });

        if (!stock) throw new NotFoundException('Stock record not found');
        return stock;
    }

    async update(id: string, updateStockDto: UpdateStockDto) {
        try {
            const stock = await this.prisma.stock.update({
                where: { id },
                data: updateStockDto,
                include: { product: true, outlet: true },
            });

            // Alert check
            await this.stockAlertsService.checkStockAfterUpdate(stock.id);

            return stock;
        } catch {
            throw new NotFoundException('Stock record not found');
        }
    }

    async adjust(id: string, adjustStockDto: AdjustStockDto) {
        const stock = await this.prisma.stock.findUnique({ where: { id } });
        if (!stock) throw new NotFoundException('Stock record not found');

        const newQuantity = stock.quantity + adjustStockDto.adjustment;

        if (newQuantity < 0) {
            throw new BadRequestException('Stock quantity cannot be negative');
        }

        const updated = await this.prisma.stock.update({
            where: { id },
            data: { quantity: newQuantity },
            include: { product: true, outlet: true },
        });

        // Alert check
        await this.stockAlertsService.checkStockAfterUpdate(updated.id);

        return updated;
    }
}
