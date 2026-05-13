import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "expensio-fallback-secret-key-32ch"
);

const EMPLOYEE_PROTECTED = ["/dashboard", "/expenses", "/approvals", "/profile"];
const ADMIN_PROTECTED = ["/admin/dashboard", "/admin/company", "/admin/employees", "/admin/expenses", "/admin/analytics"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (ADMIN_PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get("admin-token")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.type !== "admin") throw new Error();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  if (EMPLOYEE_PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get("employee-token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.type !== "employee") throw new Error();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/approvals/:path*",
    "/profile/:path*",
    "/admin/dashboard/:path*",
    "/admin/company/:path*",
    "/admin/employees/:path*",
    "/admin/expenses/:path*",
    "/admin/analytics/:path*",
  ],
};
