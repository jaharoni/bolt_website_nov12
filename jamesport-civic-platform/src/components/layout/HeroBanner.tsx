import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="bg-gradient-to-br from-[#0b4f6c] via-[#0e7490] to-[#0891b2] text-white" aria-labelledby="hero-heading">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 lg:flex-row lg:items-center">
        <div className="lg:w-2/3">
          <p className="text-sm uppercase tracking-[0.4em] text-[#bde3f5]">Jamesport Civic Association</p>
          <h1 id="hero-heading" className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
            Track property development. Stay ahead of town meetings. Protect the rural character of Jamesport.
          </h1>
          <p className="mt-6 text-xl text-[#e0f2fe]">
            The Jamesport Civic Platform centralizes ownership history, zoning changes, and meeting alerts so residents can respond quickly and confidently.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild>
              <Link href="#alerts">Get meeting alerts</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="#timeline">View property timeline</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-white/10 p-6 text-base leading-7 text-[#f0f9ff] shadow-xl lg:w-1/3">
          <h3 className="text-lg font-semibold text-white">Fast facts</h3>
          <ul className="mt-4 space-y-3">
            <li>
              • Automated monitoring of Riverhead Town Board, Planning Board, and Zoning Board postings every 3 hours.
            </li>
            <li>• Keyword watchlist for Jamesport hamlet, Route 25 corridor, and aquifer protection districts.</li>
            <li>• AI summaries for long zoning documents so neighbors can act in minutes—not days.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
