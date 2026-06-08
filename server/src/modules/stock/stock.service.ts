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

    private verifyOutletAccess(outletId: string, user?: any) {
        if (!user) return; // If AuthGuard is bypassed or user not injected, fallback to previous behavior
        const isAdmin = user.roles?.some((ur: any) => ur.role?.name?.toLowerCase().includes('admin'));
        if (isAdmin) return;
        
        const assignedOutletIds = user.outlets?.map((ou: any) => ou.outletId) || [];
        if (!assignedOutletIds.includes(outletId)) {
            import('@nestjs/common').then(m => {
                throw new m.ForbiddenException('You do not have access to manage stock for this outlet');
            });
            throw new Error('Forbidden'); // Fallback purely for runtime type guarantee
        }
    }

    private enforceFindAllAccess(where: any, filtersOutletId: string | undefined, user?: any) {
        if (!user) return;
        const isAdmin = user.roles?.some((ur: any) => ur.role?.name?.toLowerCase().includes('admin'));
        if (isAdmin) return;

        const assignedOutletIds = user.outlets?.map((ou: any) => ou.outletId) || [];
        if (filtersOutletId && !assignedOutletIds.includes(filtersOutletId)) {
             import('@nestjs/common').then(m => {
                 throw new m.ForbiddenException('You do not have access to manage stock for this outlet');
             });
             throw new Error('Forbidden');
        }
        if (!filtersOutletId) {
            where.outletId = { in: assignedOutletIds };
        }
    }

    async create(createStockDto: CreateStockDto, user?: any) {
        this.verifyOutletAccess(createStockDto.outletId, user);
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

    async findAll(filters: { outletId?: string; productId?: string } = {}, user?: any) {
        const where: any = {};
        
        this.enforceFindAllAccess(where, filters?.outletId, user);
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

    async findLowStock(outletId: string, threshold?: number, user?: any) {
        this.verifyOutletAccess(outletId, user);
        // Get all stock for the outlet with product details
        const stocks = await this.prisma.stock.findMany({
            where: { outletId },
            include: {
                product: { include: { category: true } },
                outlet: true,
            },
        });

        // Filter stocks that are below their minimum level
        return stocks.filter((stock) => {
            // Use outlet-specific minStockLevel if set, otherwise use product's minStockLevel
            const effectiveMinLevel = threshold ?? stock.minStockLevel ?? stock.product.minStockLevel;
            return stock.quantity < effectiveMinLevel;
        });
    }

    async findOne(outletId: string, productId: string, user?: any) {
        this.verifyOutletAccess(outletId, user);
        const stock = await this.prisma.stock.findUnique({
            where: {
                productId_outletId: { productId, outletId },
            },
            include: { product: true, outlet: true },
        });

        if (!stock) throw new NotFoundException('Stock record not found');
        return stock;
    }

    async update(id: string, updateStockDto: UpdateStockDto, user?: any) {
        try {
            const stock = await this.prisma.stock.findUniqueOrThrow({
                where: { id },
            });
            this.verifyOutletAccess(stock.outletId, user);

            const updatedStock = await this.prisma.stock.update({
                where: { id },
                data: updateStockDto,
                include: { product: true, outlet: true },
            });

            // Alert check
            await this.stockAlertsService.checkStockAfterUpdate(updatedStock.id);

            return updatedStock;
        } catch {
            throw new NotFoundException('Stock record not found');
        }
    }

    async adjust(id: string, adjustStockDto: AdjustStockDto, user?: any) {
        const stock = await this.prisma.stock.findUnique({ where: { id } });
        if (!stock) throw new NotFoundException('Stock record not found');
        this.verifyOutletAccess(stock.outletId, user);

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
