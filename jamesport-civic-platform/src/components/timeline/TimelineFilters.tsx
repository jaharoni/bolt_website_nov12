"use client";

import { useMemo, useState } from "react";
import { TimelineEvent, EventCategory } from "@/lib/types";
import { eventTypeOptions } from "@/lib/config/platform";
import { cn } from "@/lib/utils";

interface Props {
  events: TimelineEvent[];
  onFilter: (filtered: TimelineEvent[]) => void;
}

export function TimelineFilters({ events, onFilter }: Props) {
  const [eventType, setEventType] = useState<EventCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const tags = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => event.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set).slice(0, 12);
  }, [events]);

  const [activeTags, setActiveTags] = useState<string[]>([]);

  function applyFilters(nextType = eventType, nextTags = activeTags, nextTerm = searchTerm) {
    const filtered = events.filter((event) => {
      const typeMatch = nextType === "all" || event.eventType === nextType;
      const tagMatch = !nextTags.length || nextTags.every((tag) => event.tags.includes(tag));
      const textMatch = !nextTerm
        ? true
        : [event.title, event.description, event.tags.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(nextTerm.toLowerCase());
      return typeMatch && tagMatch && textMatch;
    });

    onFilter(filtered);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex-1 text-base text-slate-700">
          Event type
          <select
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg"
            value={eventType}
            onChange={(event) => {
              const nextType = event.target.value as EventCategory | "all";
              setEventType(nextType);
              applyFilters(nextType, undefined, undefined);
            }}
          >
            <option value="all">All events</option>
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-base text-slate-700">
          Search keywords
          <input
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg"
            placeholder="Youngs Ave, zoning, etc."
            value={searchTerm}
            onChange={(event) => {
              const nextTerm = event.target.value;
              setSearchTerm(nextTerm);
              applyFilters(undefined, undefined, nextTerm);
            }}
          />
        </label>
      </div>
      {tags.length ? (
        <div className="mt-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Popular tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold",
                    active ? "bg-[#0b4f6c] text-white" : "bg-slate-100 text-slate-700"
                  )}
                  onClick={() => {
                    const nextTags = active
                      ? activeTags.filter((value) => value !== tag)
                      : [...activeTags, tag];
                    setActiveTags(nextTags);
                    applyFilters(undefined, nextTags, undefined);
                  }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
