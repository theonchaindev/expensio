import { NextRequest, NextResponse } from "next/server";
import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getEmployeeSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true" && session.role === "MANAGER";

  const expenses = await prisma.expense.findMany({
    where: all
      ? { companyId: session.companyId }
      : { userId: session.userId, companyId: session.companyId },
    include: { user: { select: { name: true, email: true, jobTitle: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await getEmployeeSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, amount, currency, category, receiptUrl } = await req.json();

  if (!title || !amount || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      companyId: session.companyId,
      userId: session.userId,
      title,
      description,
      amount: parseFloat(amount),
      currency: currency || "GBP",
      category,
      receiptUrl,
      status: "PENDING",
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
