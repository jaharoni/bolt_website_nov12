import { SiteHeader } from "@/components/layout/SiteHeader";
import { adminLogout } from "@/app/admin/actions";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Subscribers" },
    { href: "/admin/scraper", label: "Scraper" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav aria-label="Admin navigation" className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow">
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={adminLogout} className="mt-4">
          <button className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700" type="submit">Sign out</button>
        </form>
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
