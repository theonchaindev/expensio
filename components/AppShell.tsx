"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Receipt, CheckSquare, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textOnPrimary: string;
  logoUrl: string | null;
  companyName: string;
};

type Session = {
  name: string;
  role: string;
  email: string;
};

export default function AppShell({
  children,
  theme,
  session,
}: {
  children: React.ReactNode;
  theme: Theme;
  session: Session;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "My Expenses", icon: Receipt },
    ...(session.role === "MANAGER"
      ? [{ href: "/approvals", label: "Approvals", icon: CheckSquare }]
      : []),
    { href: "/profile", label: "Profile", icon: User },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      <style>{`
        :root {
          --brand-primary: ${theme.primaryColor};
          --brand-secondary: ${theme.secondaryColor};
          --brand-accent: ${theme.accentColor};
          --brand-text-on-primary: ${theme.textOnPrimary};
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top header */}
        <header
          className="sticky top-0 z-40 shadow-sm"
          style={{ backgroundColor: "#263469" }}
        >
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt={theme.companyName} className="h-7 w-auto object-contain" />
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: theme.secondaryColor, color: theme.textOnPrimary }}
                  >
                    {theme.companyName.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: theme.textOnPrimary }}>
                    {theme.companyName}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs opacity-75" style={{ color: theme.textOnPrimary }}>
                {session.name}
              </span>
              <button onClick={logout} className="opacity-75 hover:opacity-100 transition-opacity" style={{ color: theme.textOnPrimary }}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
          {children}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-2xl mx-auto px-2 flex items-center justify-around h-16">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 flex-1"
                >
                  <item.icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: active ? theme.primaryColor : "#9CA3AF" }}
                  />
                  <span
                    className="text-xs font-medium transition-colors"
                    style={{ color: active ? theme.primaryColor : "#9CA3AF" }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
