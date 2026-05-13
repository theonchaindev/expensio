"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, ShieldCheck, Building2 } from "lucide-react";

const ACCOUNTS = [
  {
    label: "Employee",
    description: "Submit and track expenses",
    icon: User,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "bg-blue-600",
    action: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "john@demo.com", password: "test", companySlug: "demo" }),
      });
      return { ok: res.ok, redirect: "/dashboard" };
    },
  },
  {
    label: "Manager",
    description: "Approve or decline expenses",
    icon: ShieldCheck,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "bg-green-600",
    action: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "manager@demo.com", password: "test", companySlug: "demo" }),
      });
      return { ok: res.ok, redirect: "/approvals" };
    },
  },
  {
    label: "Company Admin",
    description: "Manage employees, branding & payments",
    icon: Building2,
    color: "bg-slate-50 border-slate-200 hover:bg-slate-100",
    iconColor: "bg-slate-700",
    action: async () => {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@demo.com", password: "admin" }),
      });
      return { ok: res.ok, redirect: "/admin/dashboard" };
    },
  },
];

export default function TestLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loginAs(account: (typeof ACCOUNTS)[0]) {
    setError("");
    setLoading(account.label);
    try {
      const { ok, redirect } = await account.action();
      if (!ok) {
        setError("Login failed — make sure the database is seeded.");
        return;
      }
      router.push(redirect);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Test Login</h1>
          <p className="text-slate-400 text-sm mt-1">Pick an account to log in instantly</p>
        </div>

        <div className="space-y-3">
          {ACCOUNTS.map((account) => (
            <button
              key={account.label}
              onClick={() => loginAs(account)}
              disabled={loading !== null}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${account.color}`}
            >
              <div className={`w-11 h-11 ${account.iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {loading === account.label ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <account.icon className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{account.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{account.description}</div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 bg-red-900/30 text-red-400 text-sm rounded-xl px-4 py-3 border border-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
