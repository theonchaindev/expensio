import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoSession } from "@/lib/demoData";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;
  const data = await req.json();
  const allowed = ["name", "role", "department", "jobTitle", "isActive"];
  const update = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));

  const user = await prisma.user.updateMany({
    where: { id, companyId: session.companyId },
    data: update,
  });

  if (user.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoSession(session.companyId)) {
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;
  await prisma.user.updateMany({
    where: { id, companyId: session.companyId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
