import { redirect } from "next/navigation";
import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getEmployeeSession();
  if (!session) redirect("/login");

  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  if (!company) redirect("/login");

  const theme = {
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    accentColor: company.accentColor,
    textOnPrimary: company.textOnPrimary,
    logoUrl: company.logoUrl,
    companyName: company.name,
  };

  return <AppShell theme={theme} session={session}>{children}</AppShell>;
}
