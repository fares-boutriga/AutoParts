import { Injectable, NotFoundException } from '@nestjs/common';
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
        const product = await this.prisma.product.create({
            data: createProductDto,
        });

        // Initialize stock records for all outlets
        const outlets = await this.prisma.outlet.findMany({ select: { id: true } });
        if (outlets.length > 0) {
            await this.prisma.stock.createMany({
                data: outlets.map((outlet, index) => ({
                    productId: product.id,
                    outletId: outlet.id,
                    quantity: index === 0 ? (createProductDto.initialQuantity || 0) : 0,
                    minStockLevel: product.minStockLevel || 5,
                })),
            });
        }

        return product;
    }

    async findAll(filters?: { categoryId?: string; search?: string; page?: number; limit?: number }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { reference: { contains: filters.search, mode: 'insensitive' } },
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
        const product = await this.prisma.product.findUnique({
            where: { id },
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

    async update(id: string, updateProductDto: UpdateProductDto) {
        try {
            return await this.prisma.product.update({
                where: { id },
                data: updateProductDto,
            });
        } catch (error) {
            throw new NotFoundException('Product not found');
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.product.delete({
                where: { id },
            });
            return { message: 'Product deleted successfully' };
        } catch (error) {
            throw new NotFoundException('Product not found');
        }
    }
}
