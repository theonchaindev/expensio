import { NextRequest, NextResponse } from "next/server";
import { signEmployeeToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { role } = await req.json();

  const isManager = role === "MANAGER";

  const token = await signEmployeeToken({
    userId: "demo-user",
    companyId: "demo-company",
    role: isManager ? "MANAGER" : "EMPLOYEE",
    name: isManager ? "Sarah Manager" : "John Smith",
    email: isManager ? "manager@demo.com" : "john@demo.com",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("employee-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
