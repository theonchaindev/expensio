import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
