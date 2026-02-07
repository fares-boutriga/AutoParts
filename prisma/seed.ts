import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create default permissions
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
    const createdPermissions = await Promise.all(
        permissions.map((permission) =>
            prisma.permission.upsert({
                where: { name: permission.name },
                update: {},
                create: permission,
            }),
        ),
    );
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Create default roles with permissions
    console.log('Creating default roles...');

    // Admin role - all permissions
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
    await Promise.all(
        createdPermissions.map((permission) =>
            prisma.rolePermission.create({
                data: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            }),
        ),
    );

    // Manager role
    const managerRole = await prisma.role.upsert({
        where: { name: 'Manager' },
        update: {},
        create: {
            name: 'Manager',
            description: 'Outlet management and operations',
            isCustom: false,
        },
    });

    const managerPermissions = createdPermissions.filter((p) =>
        [
            'manage_products',
            'manage_stock',
            'sell_products',
            'view_reports',
            'manage_customers',
            'view_notifications',
        ].includes(p.name),
    );

    await prisma.rolePermission.deleteMany({
        where: { roleId: managerRole.id },
    });
    await Promise.all(
        managerPermissions.map((permission) =>
            prisma.rolePermission.create({
                data: {
                    roleId: managerRole.id,
                    permissionId: permission.id,
                },
            }),
        ),
    );

    // Cashier role
    const cashierRole = await prisma.role.upsert({
        where: { name: 'Cashier' },
        update: {},
        create: {
            name: 'Cashier',
            description: 'Sales and basic operations',
            isCustom: false,
        },
    });

    const cashierPermissions = createdPermissions.filter((p) =>
        ['sell_products', 'manage_customers', 'view_notifications'].includes(
            p.name,
        ),
    );

    await prisma.rolePermission.deleteMany({
        where: { roleId: cashierRole.id },
    });
    await Promise.all(
        cashierPermissions.map((permission) =>
            prisma.rolePermission.create({
                data: {
                    roleId: cashierRole.id,
                    permissionId: permission.id,
                },
            }),
        ),
    );

    console.log('✅ Created 3 default roles (Admin, Manager, Cashier)');

    // Create default admin user
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

    // Assign admin role to admin user
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

    // Create sample outlet (using findFirst -> create instead of upsert to avoid Unique constraint error if name not unique)
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

    // Assign admin user to main outlet
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

    // Create sample categories
    const categories = [
        { name: 'Engine Parts' },
        { name: 'Brake System' },
        { name: 'Suspension' },
        { name: 'Electrical' },
        { name: 'Filters' },
    ];

    const createdCategories = await Promise.all(
        categories.map(async (category) => {
            const existing = await prisma.category.findFirst({ where: { name: category.name } });
            if (existing) return existing;
            return prisma.category.create({ data: category });
        })
    );

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
