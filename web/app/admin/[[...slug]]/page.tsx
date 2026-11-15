"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("@/admin/AdminApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">Loading Luma Threads Admin...</p>
      </div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminApp />;
}
