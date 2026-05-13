import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const company = await prisma.company.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo",
      primaryColor: "#2563EB",
      secondaryColor: "#1E40AF",
      accentColor: "#EFF6FF",
      textOnPrimary: "#FFFFFF",
    },
  });

  console.log(`✅ Company: ${company.name} (slug: ${company.slug})`);

  const adminHash = await bcrypt.hash("admin", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "admin@demo.com",
      passwordHash: adminHash,
      name: "Admin",
    },
  });

  console.log(`✅ Admin: ${admin.email} / admin`);

  const managerHash = await bcrypt.hash("test", 12);
  const manager = await prisma.user.upsert({
    where: { email_companyId: { email: "manager@demo.com", companyId: company.id } },
    update: {},
    create: {
      companyId: company.id,
      email: "manager@demo.com",
      passwordHash: managerHash,
      name: "Sarah Manager",
      role: "MANAGER",
      department: "Finance",
      jobTitle: "Finance Manager",
    },
  });

  console.log(`✅ Manager: ${manager.email} / test`);

  const employeeHash = await bcrypt.hash("test", 12);
  const employee = await prisma.user.upsert({
    where: { email_companyId: { email: "john@demo.com", companyId: company.id } },
    update: {},
    create: {
      companyId: company.id,
      email: "john@demo.com",
      passwordHash: employeeHash,
      name: "John Smith",
      role: "EMPLOYEE",
      department: "Sales",
      jobTitle: "Sales Executive",
    },
  });

  console.log(`✅ Employee: ${employee.email} / test`);

  const existing = await prisma.expense.count({ where: { userId: employee.id } });
  if (existing === 0) {
    await prisma.expense.createMany({
      data: [
        {
          companyId: company.id,
          userId: employee.id,
          title: "Client Lunch at The Ivy",
          description: "Lunch with Q4 prospect",
          amount: 87.50,
          currency: "GBP",
          category: "Meals & Entertainment",
          status: "APPROVED",
          reviewedById: manager.id,
          reviewedAt: new Date(),
        },
        {
          companyId: company.id,
          userId: employee.id,
          title: "Train to Manchester",
          description: "Sales conference travel",
          amount: 124.00,
          currency: "GBP",
          category: "Travel",
          status: "PAID",
          reviewedById: manager.id,
          reviewedAt: new Date(Date.now() - 86400000 * 5),
          paidAt: new Date(Date.now() - 86400000 * 3),
        },
        {
          companyId: company.id,
          userId: employee.id,
          title: "Hotel — Manchester Conference",
          amount: 189.00,
          currency: "GBP",
          category: "Accommodation",
          status: "PENDING",
        },
        {
          companyId: company.id,
          userId: employee.id,
          title: "Parking at HQ",
          amount: 15.00,
          currency: "GBP",
          category: "Travel",
          status: "DECLINED",
          reviewedById: manager.id,
          reviewedAt: new Date(),
          reviewNotes: "Please use public transport per company policy",
        },
      ],
    });
    console.log("✅ Sample expenses created");
  }

  console.log("\n🎉 Done!");
  console.log("   Admin:    admin@demo.com / admin");
  console.log("   Manager:  manager@demo.com / test  (company ID: demo)");
  console.log("   Employee: john@demo.com / test     (company ID: demo)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
