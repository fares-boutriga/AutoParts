# Auto Parts POS - Backend API

Production-ready NestJS backend for managing car spare parts sales outlets with inventory, sales, and intelligent stock alert features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and Gmail settings

# Run database migrations
npx prisma migrate dev

# Seed database with initial data
npx prisma db seed

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`  
Swagger documentation at `http://localhost:3000/api/docs`

## 📁 Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts               # Root module
├── common/                      # Shared utilities
│   ├── decorators/             # Custom decorators (@Roles, @Permissions, etc.)
│   └── guards/                 # Auth guards (JWT, Roles, Permissions)
├── prisma/                      # Prisma ORM service
├── modules/
│   ├── auth/                   # Authentication & JWT
│   ├── users/                  # User management
│   ├── roles/                  # Roles & permissions
│   ├── outlets/                # Outlet/branch management
│   ├── products/               # Product catalog
│   ├── stock/                  # Inventory management
│   ├── orders/                 # POS & sales
│   ├── customers/              # Customer management
│   ├── notifications/          # In-app notifications
│   ├── email/                  # Email service (Gmail)
│   └── stock-alerts/          # Stock alert system
```

## 🔐 Default Credentials

After seeding the database:
- **Email**: `admin@autoparts.com`
- **Password**: `admin123`

## 🔑 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Lifecycle
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 7 days (long-lived)

Use `/auth/refresh` to get a new access token when it expires.

## 📊 Database Schema

### Core Entities
- **Users**: System users with roles and outlet assignments
- **Roles**: Admin, Manager, Cashier (+ custom roles)
- **Permissions**: Fine-grained access control
- **Outlets**: Physical stores/branches
- **Products**: Spare parts catalog
- **Stock**: Inventory per product per outlet
- **Orders**: Sales transactions
- **Customers**: Customer directory
- **Notifications**: In-app alerts

## 🎯 Key Features

### 1. Role-Based Access Control (RBAC)
- 3 default roles: Admin, Manager, Cashier
- Create custom roles with specific permissions
- 9 permissions: manage_users, manage_roles, manage_outlets, manage_products, manage_stock, sell_products, view_reports, manage_customers, view_notifications

### 2. Multi-Outlet Support
- Users can be assigned to multiple outlets
- Stock, orders, and alerts are outlet-specific
- Each outlet can configure email alerts independently

### 3. Stock Alert System
- **Real-time alerts**: Triggered immediately on purchase
- **Backup cron job**: Configurable periodic checks (default: 5 minutes)
- **Multi-channel**: In-app notifications + email (Gmail)
- **Smart cooldown**: 24-hour alert cooldown to prevent spam
- **Configurable thresholds**: Global + outlet-specific minimum stock levels

### 4. POS (Point of Sale)
- Create orders with multiple line items
- Automatic stock deduction
- Payment methods: cash, card, credit
- Optional customer association

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate refresh token

### Users (`/users`) 🔒
- `GET /users` - List users (Admin only)
- `GET /users/:id` - Get user details
- `POST /users` - Create user (Admin)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin)
- `POST /users/:id/outlets` - Assign outlets to user
- `POST /users/:id/roles` - Assign roles to user

### Roles (`/roles`) 🔒
- `GET /roles` - List all roles
- `GET /roles/:id` - Get role with permissions
- `POST /roles` - Create custom role (Admin)
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete custom role
- `POST /roles/:id/permissions` - Assign permissions
- `DELETE /roles/:id/permissions/:permissionId` - Remove permission

### Outlets (`/outlets`) 🔒
- `GET /outlets` - List outlets
- `GET /outlets/:id` - Get outlet details
- `POST /outlets` - Create outlet (Admin)
- `PATCH /outlets/:id` - Update outlet
- `DELETE /outlets/:id` - Delete outlet

### Products (`/products`) 🔒
- `GET /products` - List products (with filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product
- `GET /categories` - List categories
- `POST /categories` - Create category

### Stock (`/stock`) 🔒
- `GET /stock` - List stock with filters
- `GET /stock/outlet/:outletId` - Get stock for outlet
- `GET /stock/outlet/:outletId/product/:productId` - Get specific stock
- `POST /stock` - Initialize stock record
- `PATCH /stock/:id` - Update stock (quantity, min level)
- `POST /stock/:id/adjust` - Adjust stock with reason

### Orders (`/orders`) 🔒
- `GET /orders` - List orders (with filters)
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order (POS)
- `PATCH /orders/:id/cancel` - Cancel order (restore stock)

### Customers (`/customers`) 🔒
- `GET /customers` - List customers
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Notifications (`/notifications`) 🔒
- `GET /notifications` - List notifications
- `GET /notifications/:id` - Get notification
- `PATCH /notifications/:id/seen` - Mark as seen
- `PATCH /notifications/seen-all` - Mark all as seen
- `DELETE /notifications/:id` - Delete notification

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Stock Alerts
STOCK_CHECK_INTERVAL="*/5 * * * *"  # Cron: every 5 minutes
STOCK_ALERT_COOLDOWN_HOURS=24

# Gmail SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
EMAIL_FROM="Auto Parts POS <your-email@gmail.com>"
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App Passwords
3. Generate an app password for "Mail"
4. Use this password in `SMTP_PASSWORD`

## 🚨 Stock Alert System

### How It Works

1. **Real-time Trigger** (Primary):
   - Every order automatically checks stock levels
   - If stock falls below minimum, alert is created immediately

2. **Background Job** (Backup):
   - Runs periodically (configurable via `STOCK_CHECK_INTERVAL`)
   - Catches any edge cases missed by real-time triggers

3. **Alert Cooldown**:
   - Prevents duplicate alerts within 24 hours
   - Configurable via `STOCK_ALERT_COOLDOWN_HOURS`

### Minimum Stock Levels

- **Global**: Set on Product (`Product.minStockLevel`)
- **Per-Outlet Override**: Set on Stock (`Stock.minStockLevel`)
- Priority: Outlet-specific > Global

### Notification Channels

1. **In-app**: Always created (stored in `notifications` table)
2. **Email**: Sent only if:
   - Outlet has `email` configured
   - `alertsEnabled` is `true`
   - SMTP credentials are valid

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod

# Format code
npm run format

# Lint code
npm run lint
```

## 📦 Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## 🔍 Swagger Documentation

Interactive API documentation is available at `/api/docs` when the server is running.

Features:
- Test endpoints directly from the browser
- View request/response schemas
- JWT authentication support

## 📚 Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer (Gmail)
- **Scheduling**: @nestjs/schedule (cron jobs)

## 🛡️ Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with configurable expiration
- Refresh token rotation
- Role and permission-based authorization guards
- Request validation with DTOs
- SQL injection protection (Prisma ORM)
- CORS enabled for frontend integration

## 📝 License

Private - All Rights Reserved

## 👤 Author

Auto Parts POS Team

## 🤝 Contributing

This is a production backend system. For modifications or enhancements, contact the development team.
