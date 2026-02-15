import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async createProduct(createProductDto: CreateProductDto) {
        return this.prisma.product.create({
            data: createProductDto,
            include: { category: true },
        });
    }

    async findAllProducts(filters?: {
        categoryId?: string;
        isActive?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Number(filters?.page) || 1;
        const limit = Number(filters?.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { reference: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    _count: { select: { stocks: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);

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

    async findOneProduct(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                stocks: {
                    include: { outlet: true },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async updateProduct(id: string, updateProductDto: UpdateProductDto) {
        try {
            return await this.prisma.product.update({
                where: { id },
                data: updateProductDto,
                include: { category: true },
            });
        } catch {
            throw new NotFoundException('Product not found');
        }
    }

    async deleteProduct(id: string) {
        try {
            // Soft delete
            return await this.prisma.product.update({
                where: { id },
                data: { isActive: false },
            });
        } catch {
            throw new NotFoundException('Product not found');
        }
    }
}
