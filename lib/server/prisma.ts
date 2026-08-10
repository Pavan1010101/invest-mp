import { PrismaClient } from '@prisma/client';

if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | null = null;

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production' && prismaInstance) {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (err) {
  console.warn('PrismaClient initialization warning (falling back to memory store):', err);
}

// Export a proxy so any property access when prisma is uninitialized throws gracefully or routes to null
export const prisma: PrismaClient = prismaInstance ?? (new Proxy({}, {
  get() {
    return () => {
      throw new Error('PrismaClient not initialized');
    };
  }
}) as any);
