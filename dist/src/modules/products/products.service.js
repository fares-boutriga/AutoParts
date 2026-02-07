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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(createProductDto) {
        return this.prisma.product.create({
            data: createProductDto,
            include: { category: true },
        });
    }
    async findAllProducts(filters) {
        const where = {};
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
        return this.prisma.product.findMany({
            where,
            include: {
                category: true,
                _count: { select: { stocks: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOneProduct(id) {
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
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async updateProduct(id, updateProductDto) {
        try {
            return await this.prisma.product.update({
                where: { id },
                data: updateProductDto,
                include: { category: true },
            });
        }
        catch {
            throw new common_1.NotFoundException('Product not found');
        }
    }
    async deleteProduct(id) {
        try {
            return await this.prisma.product.update({
                where: { id },
                data: { isActive: false },
            });
        }
        catch {
            throw new common_1.NotFoundException('Product not found');
        }
    }
    async createCategory(createCategoryDto) {
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAllCategories() {
        return this.prisma.category.findMany({
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map