@echo off
echo Creating all remaining module files...
echo.

REM Create Products module files
mkdir "src\modules\products\dto" 2>nul

echo Creating Products service...
(
echo import { Injectable, NotFoundException } from '@nestjs/common';
echo import { PrismaService } from '../../prisma/prisma.service';
echo.
echo @Injectable^(^)
echo export class ProductsService {
echo   constructor^(private prisma: PrismaService^) {}
echo.
echo   async create^(data: any^) {
echo     return this.prisma.product.create^({ data, include: { category: true } }^);
echo   }
echo.
echo   async findAll^(filters?: any^) {
echo     return this.prisma.product.findMany^({
echo       where: filters,
echo       include: { category: true },
echo       orderBy: { name: 'asc' },
echo     }^);
echo   }
echo.
echo   async findOne^(id: string^) {
echo     const product = await this.prisma.product.findUnique^({
echo       where: { id },
echo       include: { category: true, stocks: { include: { outlet: true } } },
echo     }^);
echo     if ^(!product^) throw new NotFoundException^('Product not found'^);
echo     return product;
echo   }
echo.
echo   async update^(id: string, data: any^) {
echo     try {
echo       return await this.prisma.product.update^({ where: { id }, data, include: { category: true } }^);
echo     } catch {
echo       throw new NotFoundException^('Product not found'^);
echo     }
echo   }
echo.
echo   async remove^(id: string^) {
echo     try {
echo       return await this.prisma.product.update^({ where: { id }, data: { isActive: false } }^);
echo     } catch {
echo       throw new NotFoundException^('Product not found'^);
echo     }
echo   }
echo.
echo   async createCategory^(data: any^) {
echo     return this.prisma.category.create^({ data }^);
echo   }
echo.
echo   async findAllCategories^(^) {
echo     return this.prisma.category.findMany^({ orderBy: { name: 'asc' } }^);
echo   }
echo }
) > "src\modules\products\products.service.ts"

echo Products module files created!
echo.
echo ✓ Module structure created
echo ✓ Run: npm run start:dev to test
pause
