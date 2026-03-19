const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

// Use Prisma's $executeRaw to apply the migration
async function main() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;`);
    console.log('Added barcode column');

    await prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;`);
    console.log('Added isDeleted column');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
