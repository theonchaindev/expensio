import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession, DEMO_EMPLOYEES } from "@/lib/demoData";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    return NextResponse.json(DEMO_EMPLOYEES);
  }

  const employees = await prisma.user.findMany({
    where: { companyId: session.companyId },
    select: { id: true, name: true, email: true, role: true, department: true, jobTitle: true, isActive: true, createdAt: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    return NextResponse.json({ error: "Demo mode — employees cannot be added" }, { status: 403 });
  }

  const { name, email, password, role, department, jobTitle } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email_companyId: { email, companyId: session.companyId } },
  });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role || "EMPLOYEE", department, jobTitle, companyId: session.companyId },
    select: { id: true, name: true, email: true, role: true, department: true, jobTitle: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
