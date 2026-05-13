import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "expensio-fallback-secret-key-32ch"
);

export type EmployeeSession = {
  userId: string;
  companyId: string;
  role: string;
  name: string;
  email: string;
};

export type AdminSession = {
  adminId: string;
  companyId: string;
  name: string;
  email: string;
};

export async function signEmployeeToken(payload: EmployeeSession) {
  return new SignJWT({ ...payload, type: "employee" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function signAdminToken(payload: AdminSession) {
  return new SignJWT({ ...payload, type: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getEmployeeSession(): Promise<EmployeeSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("employee-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "employee") return null;
    return payload as unknown as EmployeeSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "admin") return null;
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}
