const { PrismaClient } = require('@prisma/client');
try {
    const prisma = new PrismaClient();
    console.log("Success with empty constructor");
} catch (e) {
    console.error("Empty failed:", e.message);
}
try {
    const prisma2 = new PrismaClient({ datasourceUrl: "file:./dev.db" });
    console.log("Success with datasourceUrl");
} catch (e) {
    console.error("DatasourceUrl failed:", e.message);
}
