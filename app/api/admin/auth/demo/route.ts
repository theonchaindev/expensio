import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/auth";

export async function POST() {
  const token = await signAdminToken({
    adminId: "demo-admin",
    companyId: "demo-company",
    name: "Admin User",
    email: "admin@demo.com",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
