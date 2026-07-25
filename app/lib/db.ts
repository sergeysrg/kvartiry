import { PrismaClient } from '@prisma/client';

// Единый экземпляр Prisma. В dev переиспользуем через globalThis,
// чтобы hot-reload не плодил подключения.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
