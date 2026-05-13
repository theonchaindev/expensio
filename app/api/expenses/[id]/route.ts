import { NextRequest, NextResponse } from "next/server";
import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession, DEMO_EXPENSES } from "@/lib/demoData";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getEmployeeSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "MANAGER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status, reviewNotes } = await req.json();

  if (!["APPROVED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (isDemoSession(session.companyId)) {
    const expense = DEMO_EXPENSES.find((e) => e.id === id);
    if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...expense, status, reviewNotes, reviewedAt: new Date() });
  }

  const expense = await prisma.expense.findFirst({
    where: { id, companyId: session.companyId },
  });

  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.expense.update({
    where: { id },
    data: { status, reviewedById: session.userId, reviewedAt: new Date(), reviewNotes },
  });

  return NextResponse.json(updated);
}
