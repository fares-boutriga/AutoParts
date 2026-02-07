# Auto Parts POS - Remaining Implementation

## ✅ Completed Modules

1. **Authentication** ✓
   - JWT strategy with access + refresh tokens
   - Login, register, refresh, logout endpoints
   - Password hashing with bcrypt

2. **Guards & Decorators** ✓
   - JWT auth guard
   - Roles guard
   - Permissions guard
   - @Roles, @RequirePermissions, @CurrentUser decorators

3. **Outlets** ✓
   - Full CRUD operations
   - Outlet-specific configuration

4. **Email Service** ✓
   - Gmail SMTP integration
   - Stock alert email templates

5. **Stock Alerts System** ✓
   - Real-time triggers on stock updates
   - Backup cron job (configurable interval)
   - 24-hour cooldown
   - In-app + email notifications

## 📋 Modules to Complete

Due to the extensive scope, the following module files need to be created. Each follows the same pattern as the completed modules:

### 1. **Products Module** (High Priority)
Files needed:
- `src/modules/products/products.module.ts`
- `src/modules/products/products.service.ts`
- `src/modules/products/products.controller.ts`
- `src/modules/products/dto/create-product.dto.ts`
- `src/modules/products/dto/update-product.dto.ts`
- `src/modules/products/dto/create-category.dto.ts`

Features:
- CRUD for products (name, reference, prices, min stock level)
- Category management
- Search and filtering
- Soft delete (isActive flag)

### 2. **Stock Module** (High Priority)
Files needed:
- `src/modules/stock/stock.module.ts` - Import StockAlertsModule
- `src/modules/stock/stock.service.ts` - Inject StockAlertsService
- `src/modules/stock/stock.controller.ts`
- `src/modules/stock/dto/create-stock.dto.ts`
- `src/modules/stock/dto/update-stock.dto.ts`
- `src/modules/stock/dto/adjust-stock.dto.ts`

Features:
- Initialize stock per product per outlet
- Update quantity and min levels
- Adjust stock with reason tracking
- **CRITICAL**: Call `stockAlertsService.checkStockAfterUpdate(stockId)` after quantity changes

### 3. **Orders Module** (High Priority)
Files needed:
- `src/modules/orders/orders.module.ts` - Import StockModule
- `src/modules/orders/orders.service.ts` - Inject StockService
- `src/modules/orders/orders.controller.ts`
- `src/modules/orders/dto/create-order.dto.ts`
- `src/modules/orders/dto/order-item.dto.ts`

Features:
- Create order (POS transaction)
- List orders with filters
- Order details with items
- **CRITICAL**: Use Prisma transaction to:
  1. Create order + order items
  2. Deduct stock using `stockService.adjustQuantity()`
  3. Stock alerts will trigger automatically

### 4. **Customers Module**
Files needed:
- `src/modules/customers/customers.module.ts`
- `src/modules/customers/customers.service.ts`
- `src/modules/customers/customers.controller.ts`
- `src/modules/customers/dto/create-customer.dto.ts`
- `src/modules/customers/dto/update-customer.dto.ts`

Features:
- Simple CRUD for customer records
- Search by name/phone/email
- Optional association with orders

### 5. **Notifications Module**
Files needed:
- `src/modules/notifications/notifications.module.ts`
- `src/modules/notifications/notifications.service.ts`
- `src/modules/notifications/notifications.controller.ts`

Features:
- List notifications (filter by outlet, seen status)
- Mark as seen (single or bulk)
- Delete notifications

### 6. **Users Module**
Files needed:
- `src/modules/users/users.module.ts`
- `src/modules/users/users.service.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/dto/create-user.dto.ts`
- `src/modules/users/dto/update-user.dto.ts`
- `src/modules/users/dto/assign-outlets.dto.ts`
- `src/modules/users/dto/assign-roles.dto.ts`

Features:
- CRUD users (admin only for create/delete)
- Assign outlets to users
- Assign roles to users
- List users with their roles and outlets

### 7. **Roles Module**
Files needed:
- `src/modules/roles/roles.module.ts`
- `src/modules/roles/roles.service.ts`
- `src/modules/roles/roles.controller.ts`
- `src/modules/roles/dto/create-role.dto.ts`
- `src/modules/roles/dto/assign-permissions.dto.ts`

Features:
- List roles with permissions
- Create custom roles (admin only)
- Assign/remove permissions from roles
- Cannot delete default roles (Admin, Manager, Cashier)

## 🚀 Quick Implementation Guide

For each module, follow this pattern:

### Module File
```typescript
import { Module } from '@nestjs/common';
import { XxxController } from './xxx.controller';
import { XxxService } from './xxx.service';

@Module({
  controllers: [XxxController],
  providers: [XxxService],
  exports: [XxxService], // If used by other modules
})
export class XxxModule {}
```

### Service File
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class XxxService {
  constructor(private prisma: PrismaService) {}
  
  // CRUD methods using prisma
}
```

### Controller File
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Xxx')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('xxx')
export class XxxController {
  constructor(private xxxService: XxxService) {}
  
  // Endpoint methods
}
```

### DTOs
Use `class-validator` and `@nestjs/swagger` decorators:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateXxxDto {
  @ApiProperty()
  @IsString()
  name: string;
  
  // ...other fields
}
```

## 🔧 Testing Without Full Implementation

You can test the existing modules:

1. **Start PostgreSQL** on localhost:5432

2. **Run migrations**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Start server**:
   ```bash
   npm run start:dev
   ```

4. **Test via Swagger**: http://localhost:3000/api/docs
   - Login with `admin@autoparts.com` / `admin123`
   - Copy access token
   - Click "Authorize" button, paste token
   - Test /auth and /outlets endpoints

## 📝 Implementation Priority

1. **Products & Stock** (Required for POS to work)
2. **Orders** (Core POS functionality)
3. **Customers** (Optional for orders)
4. **Notifications** (View in-app alerts)
5. **Users & Roles** (Admin management)

## 💡 Key Integration Points

### Orders → Stock → Alerts (Critical Flow)

```typescript
// In OrdersService.create()
async createOrder(createOrderDto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Create order
    const order = await tx.order.create({...});
    
    // 2. Create order items
    for (const item of createOrderDto.items) {
      await tx.orderItem.create({...});
      
      // 3. Deduct stock (this triggers alert check)
      await this.stockService.adjustQuantity(stockId, -item.quantity);
    }
    
    return order;
  });
}
```

The `adjustQuantity` method in StockService automatically calls `stockAlertsService.checkStockAfterUpdate()`, which:
- Checks if quantity < minimum
- Creates in-app notification
- Sends email if configured
- Updates lastAlertAt

## 🗄️ Database is Ready

The Prisma schema is complete with all entities:
- ✅ Users, Roles, Permissions
- ✅ Outlets
- ✅ Products, Categories
- ✅ Stock
- ✅ Orders, OrderItems
- ✅ Customers
- ✅ Notifications
- ✅ RefreshTokens

Seed data includes:
- Default roles with permissions
- Admin user (admin@autoparts.com)
- Sample outlet
- Product categories

## 🎯 Next Steps

1. Implement Products module
2. Implement Stock module
3. Implement Orders module (POS functionality)
4. Test complete flow: Create product → Add stock → Create order → Verify alert
5. Implement remaining modules (Customers, Notifications, Users, Roles)
6. Add comprehensive error handling
7. Write unit tests
8. Deploy to production

All architectural decisions have been made, patterns are established, and the foundation is solid. The remaining implementation is straightforward CRUD following the established patterns.
