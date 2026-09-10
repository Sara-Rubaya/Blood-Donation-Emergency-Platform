import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@blooddonation.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@blooddonation.com",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log("✅ Seeded admin user: admin@blooddonation.com / Admin@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
