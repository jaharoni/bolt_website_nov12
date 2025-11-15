import Link from "next/link";
import { PLATFORM_NAME, TOWN_NAME } from "@/lib/config/platform";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4" aria-label="Primary">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Jamesport NY</p>
          <Link href="/" className="text-2xl font-bold text-slate-900">
            {PLATFORM_NAME}
          </Link>
          <p className="text-sm text-slate-500">Supporting residents of {TOWN_NAME}</p>
        </div>
        <nav className="hidden gap-6 text-lg font-medium text-slate-600 md:flex">
          <a href="#timeline">Timeline</a>
          <a href="#alerts">Alerts</a>
          <a href="#volunteer">Volunteer</a>
          <Link href="/admin/login" className="text-sm font-semibold text-[#0b4f6c]">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
