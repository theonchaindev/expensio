import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession, DEMO_EXPENSES } from "@/lib/demoData";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    return NextResponse.json(DEMO_EXPENSES);
  }

  const expenses = await prisma.expense.findMany({
    where: { companyId: session.companyId },
    include: {
      user: { select: { name: true, email: true, jobTitle: true, department: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(expenses);
}
