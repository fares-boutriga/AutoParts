import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    private mapProductWithTotalQuantity(product: any) {
        const { stocks, ...rest } = product;
        const totalQuantity = stocks.reduce((sum: number, s: any) => sum + s.quantity, 0);
        const isStocked = stocks.length > 0;
        return { ...rest, totalQuantity, isStocked };
    }

    async create(createProductDto: CreateProductDto) {
        const { initialQuantity, ...productData } = createProductDto;

        // Sanitize data: remove 'none' placeholder and undefined/null values
        const data = Object.fromEntries(
            Object.entries(productData).filter(([_, v]) => v !== undefined && v !== null && v !== 'none')
        );

        if (data.barcode) {
            const existingWithBarcode = await this.prisma.product.findFirst({
                where: { barcode: data.barcode as string, isDeleted: false },
            });
            if (existingWithBarcode) {
                throw new ConflictException('Product with this barcode already exists');
            }
        }

        const product = await this.prisma.product.create({
            data: data as any,
        });

        // Initialize stock records for all outlets
        const outlets = await this.prisma.outlet.findMany({ select: { id: true } });
        if (outlets.length > 0) {
            await this.prisma.stock.createMany({
                data: outlets.map((outlet, index) => ({
                    productId: product.id,
                    outletId: outlet.id,
                    quantity: index === 0 ? (initialQuantity || 0) : 0,
                    minStockLevel: product.minStockLevel || 5,
                })),
            });
        }

        return product;
    }

    async findAll(filters?: {
        categoryId?: string;
        search?: string;
        page?: number;
        limit?: number;
        activeOnly?: boolean;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        // Always exclude soft-deleted products
        const where: any = { isDeleted: false };

        if (filters?.activeOnly) {
            where.isActive = true;
        }

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { reference: { contains: filters.search, mode: 'insensitive' } },
                { barcode: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [rawProducts, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    stocks: { select: { quantity: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);

        const data = rawProducts.map((product) => this.mapProductWithTotalQuantity(product));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, isDeleted: false },
            include: {
                category: true,
                stocks: {
                    include: {
                        outlet: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findByReference(reference: string) {
        const normalizedReference = reference.trim();

        const product = await this.prisma.product.findFirst({
            where: {
                isDeleted: false,
                isActive: true,
                reference: {
                    equals: normalizedReference,
                    mode: 'insensitive',
                },
            },
            include: {
                category: true,
                stocks: { select: { quantity: true } },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return this.mapProductWithTotalQuantity(product);
    }

    async findByBarcode(barcode: string) {
        const normalizedBarcode = barcode.trim();

        const product = await this.prisma.product.findFirst({
            where: {
                isDeleted: false,
                isActive: true,
                barcode: {
                    equals: normalizedBarcode,
                    mode: 'insensitive',
                },
            },
            include: {
                category: true,
                stocks: { select: { quantity: true } },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return this.mapProductWithTotalQuantity(product);
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const { initialQuantity, ...updateData } = updateProductDto;

        // Sanitize: remove 'none' or undefined values
        const data = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== null && v !== 'none')
        );

        if (data.barcode) {
            const existingWithBarcode = await this.prisma.product.findFirst({
                where: { 
                    barcode: data.barcode as string, 
                    isDeleted: false,
                    id: { not: id }
                },
            });
            if (existingWithBarcode) {
                throw new ConflictException('Another product with this barcode already exists');
            }
        }

        try {
            return await this.prisma.product.update({
                where: { id },
                data: data as any,
            });
        } catch (error) {
            throw new NotFoundException('Product not found');
        }
    }

    async toggleVisibility(id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, isDeleted: false },
            select: { isActive: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return this.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive },
        });
    }

    async remove(id: string) {
        try {
            await this.prisma.product.update({
                where: { id },
                data: { isDeleted: true },
            });
            return { message: 'Product deleted successfully' };
        } catch (error) {
            throw new NotFoundException('Product not found');
        }
    }
}
