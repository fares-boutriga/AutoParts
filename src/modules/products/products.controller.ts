import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Post()
    @RequirePermissions('manage_products')
    @ApiOperation({ summary: 'Create new product' })
    @ApiBody({ type: CreateProductDto })
    createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productsService.createProduct(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'isActive', required: false })
    @ApiQuery({ name: 'search', required: false })
    findAllProducts(
        @Query('categoryId') categoryId?: string,
        @Query('isActive') isActive?: string,
        @Query('search') search?: string,
    ) {
        // Convert 'true'/'false' string to boolean if present
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

        return this.productsService.findAllProducts({
            categoryId,
            isActive: isActiveBool,
            search,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    findOneProduct(@Param('id') id: string) {
        return this.productsService.findOneProduct(id);
    }

    @Patch(':id')
    @RequirePermissions('manage_products')
    @ApiOperation({ summary: 'Update product' })
    @ApiBody({ type: UpdateProductDto })
    updateProduct(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.updateProduct(id, updateProductDto);
    }

    @Delete(':id')
    @RequirePermissions('manage_products')
    @ApiOperation({ summary: 'Soft delete product' })
    deleteProduct(@Param('id') id: string) {
        return this.productsService.deleteProduct(id);
    }

    // Categories
    @Post('categories')
    @RequirePermissions('manage_products')
    @ApiOperation({ summary: 'Create category' })
    @ApiBody({ type: CreateCategoryDto })
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.productsService.createCategory(createCategoryDto);
    }

    @Get('categories/all')
    @ApiOperation({ summary: 'Get all categories' })
    findAllCategories() {
        return this.productsService.findAllCategories();
    }
}
