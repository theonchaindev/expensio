import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession, DEMO_EXPENSES, DEMO_EMPLOYEES } from "@/lib/demoData";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    const e = DEMO_EXPENSES;
    return NextResponse.json({
      total: e.length,
      pending: e.filter((x) => x.status === "PENDING").length,
      approved: e.filter((x) => x.status === "APPROVED").length,
      paid: e.filter((x) => x.status === "PAID").length,
      employees: DEMO_EMPLOYEES.filter((x) => x.isActive).length,
      totalAmount: e.filter((x) => ["APPROVED", "PAID"].includes(x.status)).reduce((s, x) => s + x.amount, 0),
    });
  }

  const [total, pending, approved, paid, employees, totalAmount] = await Promise.all([
    prisma.expense.count({ where: { companyId: session.companyId } }),
    prisma.expense.count({ where: { companyId: session.companyId, status: "PENDING" } }),
    prisma.expense.count({ where: { companyId: session.companyId, status: "APPROVED" } }),
    prisma.expense.count({ where: { companyId: session.companyId, status: "PAID" } }),
    prisma.user.count({ where: { companyId: session.companyId, isActive: true } }),
    prisma.expense.aggregate({
      where: { companyId: session.companyId, status: { in: ["APPROVED", "PAID"] } },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({ total, pending, approved, paid, employees, totalAmount: totalAmount._sum.amount || 0 });
}
