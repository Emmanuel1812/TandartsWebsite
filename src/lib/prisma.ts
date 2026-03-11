import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

console.log('Prisma Initialization Check:', {
  hasDbUrl: !!process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV,
});

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: DATABASE_URL is missing in production environment!');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    process.env.DATABASE_URL
      ? {
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
