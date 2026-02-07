"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const permissions = [
        {
            name: 'manage_users',
            description: 'Create, update, delete users and assign roles',
        },
        {
            name: 'manage_roles',
            description: 'Create and manage custom roles and permissions',
        },
        {
            name: 'manage_outlets',
            description: 'Create, update, delete outlets',
        },
        {
            name: 'manage_products',
            description: 'Create, update, delete products and categories',
        },
        {
            name: 'manage_stock',
            description: 'Update stock levels and manage inventory',
        },
        {
            name: 'sell_products',
            description: 'Create orders and process sales',
        },
        {
            name: 'view_reports',
            description: 'View sales reports and analytics',
        },
        {
            name: 'manage_customers',
            description: 'Create, update, delete customers',
        },
        {
            name: 'view_notifications',
            description: 'View in-app notifications',
        },
    ];
    console.log('Creating permissions...');
    const createdPermissions = await Promise.all(permissions.map((permission) => prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
    })));
    console.log(`✅ Created ${createdPermissions.length} permissions`);
    console.log('Creating default roles...');
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Full system access',
            isCustom: false,
        },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
    await Promise.all(createdPermissions.map((permission) => prisma.rolePermission.create({
        data: {
            roleId: adminRole.id,
            permissionId: permission.id,
        },
    })));
    const managerRole = await prisma.role.upsert({
        where: { name: 'Manager' },
        update: {},
        create: {
            name: 'Manager',
            description: 'Outlet management and operations',
            isCustom: false,
        },
    });
    const managerPermissions = createdPermissions.filter((p) => [
        'manage_products',
        'manage_stock',
        'sell_products',
        'view_reports',
        'manage_customers',
        'view_notifications',
    ].includes(p.name));
    await prisma.rolePermission.deleteMany({
        where: { roleId: managerRole.id },
    });
    await Promise.all(managerPermissions.map((permission) => prisma.rolePermission.create({
        data: {
            roleId: managerRole.id,
            permissionId: permission.id,
        },
    })));
    const cashierRole = await prisma.role.upsert({
        where: { name: 'Cashier' },
        update: {},
        create: {
            name: 'Cashier',
            description: 'Sales and basic operations',
            isCustom: false,
        },
    });
    const cashierPermissions = createdPermissions.filter((p) => ['sell_products', 'manage_customers', 'view_notifications'].includes(p.name));
    await prisma.rolePermission.deleteMany({
        where: { roleId: cashierRole.id },
    });
    await Promise.all(cashierPermissions.map((permission) => prisma.rolePermission.create({
        data: {
            roleId: cashierRole.id,
            permissionId: permission.id,
        },
    })));
    console.log('✅ Created 3 default roles (Admin, Manager, Cashier)');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@autoparts.com' },
        update: {},
        create: {
            email: 'admin@autoparts.com',
            password: hashedPassword,
            name: 'System Administrator',
            phone: '+1234567890',
            isActive: true,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });
    console.log('✅ Created default admin user (admin@autoparts.com / admin123)');
    let mainOutlet = await prisma.outlet.findFirst({
        where: { name: 'Main Store' },
    });
    if (!mainOutlet) {
        mainOutlet = await prisma.outlet.create({
            data: {
                name: 'Main Store',
                address: '123 Auto Street, Car City',
                phone: '+1234567890',
                email: 'main@autoparts.com',
                alertsEnabled: true,
            },
        });
    }
    await prisma.userOutlet.upsert({
        where: {
            userId_outletId: {
                userId: adminUser.id,
                outletId: mainOutlet.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            outletId: mainOutlet.id,
        },
    });
    console.log('✅ Created sample outlet (Main Store)');
    const categories = [
        { name: 'Engine Parts' },
        { name: 'Brake System' },
        { name: 'Suspension' },
        { name: 'Electrical' },
        { name: 'Filters' },
    ];
    const createdCategories = await Promise.all(categories.map(async (category) => {
        const existing = await prisma.category.findFirst({ where: { name: category.name } });
        if (existing)
            return existing;
        return prisma.category.create({ data: category });
    }));
    console.log(`✅ Created ${createdCategories.length} product categories`);
    console.log('✨ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map