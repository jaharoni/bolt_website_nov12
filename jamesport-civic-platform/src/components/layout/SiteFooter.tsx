import Link from "next/link";
import { CONTACT_EMAIL, PLATFORM_NAME } from "@/lib/config/platform";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
      <p>
        © {new Date().getFullYear()} {PLATFORM_NAME}. Questions? <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#0b4f6c]">{CONTACT_EMAIL}</a>
      </p>
      <p className="mt-2">
        <Link href="/admin/login" className="text-[#0b4f6c]">
          Admin Portal
        </Link>
      </p>
    </footer>
  );
}
