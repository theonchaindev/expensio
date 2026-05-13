import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default async function ExpensesPage() {
  const session = await getEmployeeSession();
  if (!session) return null;

  let expenses: Awaited<ReturnType<typeof prisma.expense.findMany>> = [];
  try {
    expenses = await prisma.expense.findMany({
      where: { userId: session.userId, companyId: session.companyId },
      orderBy: { submittedAt: "desc" },
    });
  } catch {}

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
        <Link
          href="/expenses/new"
          className="flex items-center gap-1.5 text-sm font-medium text-white rounded-xl px-4 py-2"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          <PlusCircle className="w-4 h-4" />
          New
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-medium text-gray-700">No expenses yet</p>
          <p className="text-sm text-gray-500 mt-1">Submit your first expense claim</p>
          <Link
            href="/expenses/new"
            className="inline-block mt-4 text-sm font-medium text-white rounded-xl px-5 py-2.5"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Submit Expense
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{expense.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {expense.category} · {new Date(expense.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {expense.description && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{expense.description}</p>
                  )}
                  {expense.reviewNotes && (
                    <p className="text-xs text-red-500 mt-1 italic">&ldquo;{expense.reviewNotes}&rdquo;</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="font-bold text-gray-900">{fmt(expense.amount)}</span>
                  <StatusBadge status={expense.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
