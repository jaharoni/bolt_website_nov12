"use client";

import { useState } from "react";
import { TimelineEvent } from "@/lib/types";
import { TimelineFilters } from "@/components/timeline/TimelineFilters";
import { TimelineEventCard } from "@/components/timeline/TimelineEventCard";

interface Props {
  events: TimelineEvent[];
}

export function TimelineSection({ events }: Props) {
  const [filtered, setFiltered] = useState(events);

  return (
    <section id="timeline" aria-label="Property development timeline" className="bg-[#f8fbff]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Historical context</p>
          <h2 className="mt-2 text-4xl font-semibold text-slate-900">Interactive development timeline</h2>
          <p className="mt-2 text-lg text-slate-600">
            Explore ownership changes, zoning decisions, and public hearings impacting Jamesport parcels.
          </p>
        </div>
        <TimelineFilters events={events} onFilter={setFiltered} />
        <ol className="mt-8 space-y-6">
          {filtered.map((event) => (
            <li key={event.id}>
              <TimelineEventCard event={event} />
            </li>
          ))}
          {!filtered.length && (
            <p className="text-lg font-semibold text-slate-600">
              No events match the current filters. Try resetting the filters above.
            </p>
          )}
        </ol>
      </div>
    </section>
  );
}
