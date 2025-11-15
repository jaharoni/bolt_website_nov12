import { ReactNode } from "react";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Jamesport Civic Platform
            </p>
            <h1 className="text-2xl font-semibold text-brand-primary">
              Admin control room
            </h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
    </div>
  );
}
