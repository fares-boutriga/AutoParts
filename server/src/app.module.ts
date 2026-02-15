import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { ProductsModule } from './modules/products/products.module';
import { StockModule } from './modules/stock/stock.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CustomersModule } from './modules/customers/customers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { StockAlertsModule } from './modules/stock-alerts/stock-alerts.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    OutletsModule,
    ProductsModule,
    StockModule,
    OrdersModule,
    CustomersModule,
    NotificationsModule,
    EmailModule,
    StockAlertsModule,
  ],
})
export class AppModule { }
