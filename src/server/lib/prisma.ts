import { env } from "../env.mjs";

import { PrismaClient } from '@/generated/prisma/client'

export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});