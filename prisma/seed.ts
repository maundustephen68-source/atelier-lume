import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "owner@atelierlume.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        hashedPassword: await bcrypt.hash(adminPassword, 12),
        role: "owner",
      },
    });
    console.log(`Created admin user: ${adminEmail} / ${adminPassword} (CHANGE THIS PASSWORD)`);
  }

  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: "Signature Portrait Session",
          description: "A one-on-one portrait session in natural light, studio or on location, with a curated edit delivered in your private gallery.",
          durationMinutes: 60,
          price: 180,
          category: "portrait",
          sortOrder: 1,
        },
        {
          name: "Full Wedding Coverage",
          description: "Full-day documentary wedding coverage from preparation through reception, two photographers, complete edited gallery.",
          durationMinutes: 480,
          price: 2200,
          category: "wedding",
          sortOrder: 2,
        },
        {
          name: "Event Coverage (Half Day)",
          description: "Four hours of candid event coverage for launches, conferences, or celebrations, delivered within one week.",
          durationMinutes: 240,
          price: 650,
          category: "event",
          sortOrder: 3,
        },
        {
          name: "Product Photography Package",
          description: "Studio product photography for up to 15 SKUs, styled and lit for e-commerce and social use.",
          durationMinutes: 120,
          price: 320,
          category: "product",
          sortOrder: 4,
        },
      ],
    });
    console.log("Seeded 4 sample service packages.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
