import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signEmployeeToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, companySlug } = await req.json();

  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { email_companyId: { email, companyId: company.id } },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await signEmployeeToken({
    userId: user.id,
    companyId: company.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  const res = NextResponse.json({
    ok: true,
    role: user.role,
    company: {
      name: company.name,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      accentColor: company.accentColor,
      textOnPrimary: company.textOnPrimary,
      logoUrl: company.logoUrl,
    },
  });

  res.cookies.set("employee-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
