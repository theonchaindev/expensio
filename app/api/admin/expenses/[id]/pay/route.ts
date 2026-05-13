import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession, DEMO_EXPENSES } from "@/lib/demoData";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (isDemoSession(session.companyId)) {
    const expense = DEMO_EXPENSES.find((e) => e.id === id);
    if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...expense, status: "PAID", paidAt: new Date() });
  }

  const expense = await prisma.expense.findFirst({
    where: { id, companyId: session.companyId, status: "APPROVED" },
  });

  if (!expense) return NextResponse.json({ error: "Expense not found or not approved" }, { status: 404 });

  const updated = await prisma.expense.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });

  return NextResponse.json(updated);
}
