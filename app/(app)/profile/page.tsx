import { getEmployeeSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogOut, User } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const session = await getEmployeeSession();
  if (!session) return null;

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, role: true, department: true, jobTitle: true, createdAt: true },
    }).catch(() => null),
    prisma.expense.groupBy({
      by: ["status"],
      where: { userId: session.userId },
      _count: true,
      _sum: { amount: true },
    }).catch(() => []),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  const paid = stats.find((s) => s.status === "PAID");
  const approved = stats.find((s) => s.status === "APPROVED");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            {(user?.name ?? session.name).charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name ?? session.name}</p>
            <p className="text-gray-500 text-sm">{user?.email ?? session.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {(user?.role ?? session.role) === "MANAGER" ? "Manager" : "Employee"}
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-50 pt-4">
          {user?.jobTitle && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Job Title</span>
              <span className="font-medium text-gray-900">{user.jobTitle}</span>
            </div>
          )}
          {user?.department && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Department</span>
              <span className="font-medium text-gray-900">{user.department}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Expense Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700">{fmt((paid?._sum.amount || 0) + (approved?._sum.amount || 0))}</p>
            <p className="text-xs text-green-600 mt-0.5">Approved & Paid</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-700">{paid?._count || 0}</p>
            <p className="text-xs text-blue-600 mt-0.5">Paid Out</p>
          </div>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
