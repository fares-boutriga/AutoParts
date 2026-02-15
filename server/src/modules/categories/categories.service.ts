import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    async findAll() {
        return this.prisma.category.findMany({
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        try {
            return await this.prisma.category.update({
                where: { id },
                data: updateCategoryDto,
            });
        } catch {
            throw new NotFoundException('Category not found');
        }
    }

    async remove(id: string) {
        try {
            // Check if category has products
            const category = await this.prisma.category.findUnique({
                where: { id },
                include: { _count: { select: { products: true } } },
            });

            if (category && category._count && category._count.products > 0) {
                // For now, let's not allow deleting categories with products
                // or we could set categoryId to null in products (SetNull is already in schema)
                throw new Error('Cannot delete category with products');
            }

            return await this.prisma.category.delete({
                where: { id },
            });
        } catch {
            throw new NotFoundException('Category not found');
        }
    }
}
