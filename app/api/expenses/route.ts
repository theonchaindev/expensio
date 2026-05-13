import { NextRequest, NextResponse } from "next/server";
import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession, DEMO_EXPENSES } from "@/lib/demoData";
import { getDemoSubmissions, addDemoExpense } from "@/lib/demoStore";

export async function GET(req: NextRequest) {
  const session = await getEmployeeSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    const all = req.nextUrl.searchParams.get("all") === "true" && session.role === "MANAGER";
    const submitted = getDemoSubmissions();
    const base = all ? DEMO_EXPENSES : DEMO_EXPENSES.filter((e) => e.userId === session.userId);
    const extra = all ? submitted : submitted.filter((e) => e.userId === session.userId);
    return NextResponse.json([...extra, ...base]);
  }

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

  if (isDemoSession(session.companyId)) {
    if (!title || !amount || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const expense = {
      id: `demo-submitted-${Date.now()}`,
      companyId: "demo-company",
      userId: session.userId,
      title,
      description: description || null,
      amount: parseFloat(amount),
      currency: currency || "GBP",
      category,
      receiptUrl: receiptUrl || null,
      status: "PENDING",
      submittedAt: new Date(),
      reviewedById: null,
      reviewedAt: null,
      reviewNotes: null,
      paidAt: null,
      user: { name: session.name, email: session.email, jobTitle: "", department: "" },
      reviewedBy: null,
    };
    addDemoExpense(expense);
    return NextResponse.json(expense, { status: 201 });
  }

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
