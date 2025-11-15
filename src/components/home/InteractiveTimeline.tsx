"use client";

import { useMemo, useState } from "react";
import { TimelineEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils/date";
import clsx from "clsx";

const filters = [
  { label: "All events", value: "all" },
  { label: "Zoning", value: "zoning" },
  { label: "Hearings", value: "hearing" },
  { label: "Development", value: "development" },
  { label: "Legislation", value: "legislation" },
];

type Props = {
  events: TimelineEvent[];
};

const InteractiveTimeline = ({ events }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showDrafts, setShowDrafts] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!showDrafts && event.status === "draft") {
        return false;
      }
      if (selectedFilter === "all") {
        return true;
      }
      return event.eventType === selectedFilter;
    });
  }, [events, selectedFilter, showDrafts]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-semibold border focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary",
              selectedFilter === filter.value
                ? "bg-brand-primary text-white border-brand-primary"
                : "border-slate-300 text-slate-600 bg-white"
            )}
            aria-pressed={selectedFilter === filter.value}
          >
            {filter.label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={showDrafts}
            onChange={(event) => setShowDrafts(event.target.checked)}
          />
          Show drafts
        </label>
      </div>
      <ol className="mt-8 space-y-6">
        {filteredEvents.map((event) => (
          <li key={event.id} className="relative pl-8">
            <span className="absolute left-0 top-3 h-3 w-3 rounded-full bg-brand-primary" />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {formatDate(event.date)}
                </span>
                <span className="rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold px-3 py-1">
                  {event.eventType}
                </span>
                {event.status === "draft" && (
                  <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
                    Draft
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-brand-primary">
                {event.title}
              </h3>
              <p className="mt-2 text-slate-600">{event.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {event.sourceUrl && (
                <a
                  href={event.sourceUrl}
                  className="mt-4 inline-flex text-brand-primary underline text-sm font-semibold"
                  target="_blank"
                  rel="noreferrer"
                >
                  View source document
                </a>
              )}
            </div>
          </li>
        ))}
        {filteredEvents.length === 0 && (
          <p className="text-slate-600 text-lg">
            No events match the selected filters. Try another combination.
          </p>
        )}
      </ol>
    </div>
  );
};

export default InteractiveTimeline;
