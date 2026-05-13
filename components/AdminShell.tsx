"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Receipt, Building2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

type Session = { name: string; email: string } | null;

export default function AdminShell({ children, session }: { children: React.ReactNode; session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/expenses", label: "Expenses", icon: Receipt },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/company", label: "Company Settings", icon: Building2 },
  ];

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0f1529" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "#1a2347", borderRight: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between">
            <div>
              <Image src="/dbfb-logo-white.svg" alt="dbfb" width={80} height={32} />
              <p className="text-xs mt-1" style={{ color: "#EC5F5B" }}>Your Expenses · Admin</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={active
                  ? { backgroundColor: "#EC5F5B", color: "#fff" }
                  : { color: "rgba(255,255,255,0.55)" }
                }
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {session && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-white truncate">{session.name}</p>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{session.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-xl transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#EC5F5B"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(236,95,91,0.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30" style={{ backgroundColor: "#1a2347", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-white/70">
            {navItems.find((n) => n.href === pathname)?.label || "Admin"}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
