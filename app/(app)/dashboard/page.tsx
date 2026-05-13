import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Clock, CheckCircle, XCircle, Banknote } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const session = await getEmployeeSession();
  if (!session) return null;

  let expenses: Awaited<ReturnType<typeof prisma.expense.findMany>> = [];
  try {
    expenses = await prisma.expense.findMany({
      where: { userId: session.userId },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });
  } catch {}

  const stats = {
    pending: expenses.filter((e) => e.status === "PENDING").length,
    approved: expenses.filter((e) => e.status === "APPROVED").length,
    paid: expenses.filter((e) => e.status === "PAID").length,
    total: expenses.reduce((s, e) => s + e.amount, 0),
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hello, {session.name.split(" ")[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{session.role === "MANAGER" ? "Manager" : "Employee"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Paid Out", value: stats.paid, icon: Banknote, color: "text-blue-600 bg-blue-50" },
          { label: "Total Claimed", value: fmt(stats.total), icon: XCircle, color: "text-purple-600 bg-purple-50", wide: true },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl p-4 shadow-sm ${s.wide ? "" : ""}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <Link
        href="/expenses/new"
        className="flex items-center gap-3 w-full rounded-2xl p-4 text-white shadow-md hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))` }}
      >
        <PlusCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <div className="font-semibold">Submit an Expense</div>
          <div className="text-xs opacity-80">Log a new expense claim</div>
        </div>
      </Link>

      {/* Recent expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Recent Expenses</h2>
          <Link href="/expenses" className="text-sm" style={{ color: "var(--brand-primary)" }}>
            View all
          </Link>
        </div>

        <div className="space-y-2">
          {expenses.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-2xl">
              <p className="text-sm">No expenses yet</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{expense.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{expense.category} · {new Date(expense.submittedAt).toLocaleDateString("en-GB")}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                  <span className="font-semibold text-gray-900 text-sm">{fmt(expense.amount)}</span>
                  <StatusBadge status={expense.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
