import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

type Section = {
  key: string;
  label: string;
  element: React.ReactNode;
};

type AdminShellProps = {
  sections: Section[];
  defaultKey?: string;
};

export default function AdminShell({ sections, defaultKey }: AdminShellProps) {
  const [active, setActive] = useState<string>(defaultKey ?? sections[0]?.key);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display font-semibold text-white">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-white/80 hover:text-white text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cn(
                "px-6 py-2.5 rounded-t-lg transition-all text-sm font-medium",
                active === s.key
                  ? "bg-white/20 text-white border-b-2 border-yellow-400 shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="glass-card p-6 min-h-[60vh]">
        {sections.find((s) => s.key === active)?.element}
      </main>
    </div>
  );
}
