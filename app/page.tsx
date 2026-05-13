import Link from "next/link";
import { Receipt, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Expensio</h1>
          <p className="text-slate-400 mt-2 text-sm">Choose how you want to sign in</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="flex items-center gap-4 w-full bg-white text-slate-900 rounded-2xl p-5 shadow-xl hover:bg-blue-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-base">Employee / Manager</div>
              <div className="text-sm text-slate-500 mt-0.5">Submit and manage your expenses</div>
            </div>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-4 w-full bg-slate-800 text-white rounded-2xl p-5 shadow-xl hover:bg-slate-700 transition-colors group border border-slate-700"
          >
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-600 transition-colors">
              <Settings className="w-6 h-6 text-slate-300" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-base">Company Admin</div>
              <div className="text-sm text-slate-400 mt-0.5">Manage your company and pay expenses</div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/test-login" className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2 transition-colors">
            Test Login
          </Link>
        </div>
      </div>
    </div>
  );
}
