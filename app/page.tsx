import Link from "next/link";
import { Receipt, Settings } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #263469 0%, #1a2347 100%)" }}>
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Image src="/dbfb-logo-white.svg" alt="dbfb" width={140} height={56} priority />
          </div>
          <h1 className="text-3xl font-bold text-white">Your Expenses</h1>
          <p className="text-slate-400 mt-2 text-sm">Choose how you want to sign in</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="flex items-center gap-4 w-full bg-white text-slate-900 rounded-2xl p-5 shadow-xl hover:bg-red-50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:opacity-90 transition-opacity" style={{ backgroundColor: "#EC5F5B" }}>
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-base">Employee / Manager</div>
              <div className="text-sm text-slate-500 mt-0.5">Submit and manage your expenses</div>
            </div>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-4 w-full rounded-2xl p-5 shadow-xl hover:opacity-90 transition-opacity border border-white/10"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-base text-white">Company Admin</div>
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
