"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Banknote, Filter } from "lucide-react";

type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  submittedAt: string;
  paidAt?: string;
  reviewNotes?: string;
  user: { name: string; email: string; department?: string };
  reviewedBy?: { name: string };
};

const STATUSES = ["ALL", "PENDING", "APPROVED", "DECLINED", "PAID"];

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [paying, setPaying] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/expenses");
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function pay(id: string) {
    setPaying(id);
    await fetch(`/api/admin/expenses/${id}/pay`, { method: "POST" });
    await load();
    setPaying(null);
  }

  const fmt = (n: number, currency = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);

  const filtered = filter === "ALL" ? expenses : expenses.filter((e) => e.status === filter);
  const approvedTotal = expenses.filter((e) => e.status === "APPROVED").reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-slate-400 text-sm mt-1">{expenses.length} total expenses</p>
        </div>
        {approvedTotal > 0 && (
          <div className="bg-green-900/30 border border-green-800 rounded-xl px-4 py-2.5 text-sm">
            <span className="text-green-400 font-semibold">{fmt(approvedTotal)}</span>
            <span className="text-green-600 ml-1">awaiting payment</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"}`}
          >
            {s === "ALL" ? `All (${expenses.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${expenses.filter((e) => e.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">No expenses found</p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filtered.map((expense) => (
              <div key={expense.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white text-sm">{expense.title}</p>
                      <StatusBadge status={expense.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {expense.user.name}
                      {expense.user.department ? ` · ${expense.user.department}` : ""}
                      {" · "}{expense.category}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted {new Date(expense.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {expense.reviewNotes && (
                      <p className="text-xs text-slate-500 italic mt-1">&ldquo;{expense.reviewNotes}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-bold text-white">{fmt(expense.amount, expense.currency)}</span>
                    {expense.status === "APPROVED" && (
                      <button
                        onClick={() => pay(expense.id)}
                        disabled={paying === expense.id}
                        className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        {paying === expense.id ? "Processing…" : "Mark as Paid"}
                      </button>
                    )}
                    {expense.status === "PAID" && expense.paidAt && (
                      <span className="text-xs text-slate-500">
                        Paid {new Date(expense.paidAt).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
