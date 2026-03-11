import config from './prisma.config.js';
import { PrismaClient } from '@prisma/client';
try {
    const prisma = new PrismaClient(config);
    console.log("Success with config");
} catch (e) {
    console.error("Config failed:", e.message);
}
