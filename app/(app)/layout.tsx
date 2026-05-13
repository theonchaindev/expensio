import { redirect } from "next/navigation";
import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

const DEMO_THEME = {
  primaryColor: "#2563EB",
  secondaryColor: "#1E40AF",
  accentColor: "#EFF6FF",
  textOnPrimary: "#FFFFFF",
  logoUrl: null as string | null,
  companyName: "Demo Company",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getEmployeeSession();
  if (!session) redirect("/login");

  let theme = DEMO_THEME;
  try {
    const company = await prisma.company.findUnique({ where: { id: session.companyId } });
    if (company) {
      theme = {
        primaryColor: company.primaryColor,
        secondaryColor: company.secondaryColor,
        accentColor: company.accentColor,
        textOnPrimary: company.textOnPrimary,
        logoUrl: company.logoUrl,
        companyName: company.name,
      };
    }
  } catch {}

  return <AppShell theme={theme} session={session}>{children}</AppShell>;
}
