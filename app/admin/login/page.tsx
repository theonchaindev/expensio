"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your details.");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #263469 0%, #1a2347 100%)" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="rounded-2xl shadow-2xl p-8" style={{ backgroundColor: "#1a2347", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-8">
            <Image src="/dbfb-logo-white.svg" alt="dbfb" width={90} height={36} className="mb-4" />
            <h1 className="text-xl font-bold text-white">Your Expenses</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Company admin portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 placeholder-slate-600"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", outlineColor: "#EC5F5B" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 placeholder-slate-600"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </div>

            {error && (
              <div className="text-sm rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(236,95,91,0.15)", color: "#EC5F5B", border: "1px solid rgba(236,95,91,0.3)" }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-xl py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#EC5F5B" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
