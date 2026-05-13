import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  return NextResponse.json(company);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const allowed = ["name", "logoUrl", "primaryColor", "secondaryColor", "accentColor", "textOnPrimary", "address", "website"];
  const update = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));

  const company = await prisma.company.update({
    where: { id: session.companyId },
    data: update,
  });

  return NextResponse.json(company);
}
