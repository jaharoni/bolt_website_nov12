import { LucideIcon, Radar, FileSearch, BellRing } from "lucide-react";

interface Card {
  icon: LucideIcon;
  title: string;
  description: string;
}

const cards: Card[] = [
  {
    icon: Radar,
    title: "Automated watch",
    description: "Playwright scraper checks the Town of Riverhead sites, RSS feeds, and PDF agendas every 3 hours.",
  },
  {
    icon: FileSearch,
    title: "Keyword intelligence",
    description: "We flag parcels, block & lot numbers, and developer names tied to Jamesport hamlet projects.",
  },
  {
    icon: BellRing,
    title: "Immediate alerts",
    description: "When keywords match, the platform drafts an email/SMS alert for admin approval before sending residents a notice.",
  },
];

export function MonitoringExplainer() {
  return (
    <section className="bg-[#0b4f6c] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm uppercase tracking-[0.4em] text-[#9ad5f3]">Meeting detection</p>
        <h2 className="mt-2 text-4xl font-semibold">Automated monitoring for Riverhead posts</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-3xl bg-white/10 p-6">
              <card.icon className="h-10 w-10 text-[#fcd34d]" aria-hidden />
              <h3 className="mt-4 text-2xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-lg text-[#e0f2fe]">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
