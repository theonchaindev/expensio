import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, Receipt, Clock, CheckCircle, Banknote, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [company, stats, recentExpenses] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.companyId } }).catch(() => null),
    Promise.all([
      prisma.expense.count({ where: { companyId: session.companyId } }).catch(() => 0),
      prisma.expense.count({ where: { companyId: session.companyId, status: "PENDING" } }).catch(() => 0),
      prisma.expense.count({ where: { companyId: session.companyId, status: "APPROVED" } }).catch(() => 0),
      prisma.expense.count({ where: { companyId: session.companyId, status: "PAID" } }).catch(() => 0),
      prisma.user.count({ where: { companyId: session.companyId, isActive: true } }).catch(() => 0),
      prisma.expense.aggregate({
        where: { companyId: session.companyId, status: { in: ["APPROVED", "PAID"] } },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
    ]),
    prisma.expense.findMany({
      where: { companyId: session.companyId },
      include: { user: { select: { name: true } } },
      orderBy: { submittedAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }).catch(() => []),
  ]);

  const [total, pending, approved, paid, employees, totalAmount] = stats;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">{company?.name ?? "Demo Company"} Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all company expenses</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: employees, icon: Users, color: "text-blue-400" },
          { label: "Pending Review", value: pending, icon: Clock, color: "text-amber-400" },
          { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-400" },
          { label: "Paid Out", value: paid, icon: Banknote, color: "text-purple-400" },
          { label: "Total Expenses", value: total, icon: Receipt, color: "text-slate-400" },
          { label: "Approved Value", value: fmt(totalAmount._sum.amount || 0), icon: TrendingUp, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent expenses */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Expenses</h2>
          <a href="/admin/expenses" className="text-xs text-blue-400 hover:text-blue-300">View all →</a>
        </div>
        <div className="divide-y divide-slate-700/50">
          {recentExpenses.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No expenses yet</p>
          ) : (
            recentExpenses.map((e) => (
              <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.title}</p>
                  <p className="text-xs text-slate-500">{e.user.name} · {e.category}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-white">{fmt(e.amount)}</span>
                  <StatusBadge status={e.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
