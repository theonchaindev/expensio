"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

type Expense = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  receiptUrl?: string;
  status: string;
  submittedAt: string;
  reviewNotes?: string;
  user: { name: string; email: string; jobTitle?: string };
};

export default function ApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/expenses?all=true");
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "APPROVED" | "DECLINED") {
    setProcessing(id);
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNotes: reviewNotes[id] || "" }),
    });
    await load();
    setProcessing(null);
    setExpanded(null);
  }

  const fmt = (n: number, currency = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);

  const pending = expenses.filter((e) => e.status === "PENDING");
  const reviewed = expenses.filter((e) => e.status !== "PENDING");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "var(--brand-primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">{pending.length} pending review</p>
      </div>

      {pending.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">No expenses awaiting approval</p>
        </div>
      )}

      <div className="space-y-2">
        {pending.map((expense) => (
          <div key={expense.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === expense.id ? null : expense.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <p className="font-semibold text-gray-900 text-sm truncate">{expense.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {expense.user.name} · {expense.category}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(expense.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="font-bold text-gray-900">{fmt(expense.amount, expense.currency)}</span>
                  {expanded === expense.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </button>

            {expanded === expense.id && (
              <div className="px-4 pb-4 border-t border-gray-50 space-y-3 pt-3">
                {expense.description && (
                  <p className="text-sm text-gray-600">{expense.description}</p>
                )}
                {expense.receiptUrl && (
                  <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm underline" style={{ color: "var(--brand-primary)" }}>
                    View receipt
                  </a>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
                  <textarea
                    value={reviewNotes[expense.id] || ""}
                    onChange={(e) => setReviewNotes((n) => ({ ...n, [expense.id]: e.target.value }))}
                    placeholder="Add a note for the employee..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(expense.id, "APPROVED")}
                    disabled={processing === expense.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => decide(expense.id, "DECLINED")}
                    disabled={processing === expense.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 text-sm mb-2">Recently Reviewed</h2>
          <div className="space-y-2">
            {reviewed.slice(0, 10).map((expense) => (
              <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{expense.title}</p>
                  <p className="text-xs text-gray-500">{expense.user.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3">
                  <span className="font-semibold text-sm text-gray-900">{fmt(expense.amount, expense.currency)}</span>
                  <StatusBadge status={expense.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
