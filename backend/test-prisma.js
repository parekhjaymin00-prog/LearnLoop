const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
    try {
        const email = "newuser@test.com";
        const password = "password123";
        console.log("Finding user");
        const user = await prisma.user.findUnique({ where: { email } });
        console.log("Found:", user);
        
        console.log("Comparing password", password, user.password);
        const isValid = await bcrypt.compare(password, user.password);
        console.log("isValid:", isValid);
    } catch (e) {
        console.error("Crash:", e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
