import { TimelineEvent } from "@/lib/types";
import { formatEventDate } from "@/lib/utils";
import { TagList } from "@/components/timeline/TimelineTags";

interface Props {
  event: TimelineEvent;
}

const eventColors: Record<TimelineEvent["eventType"], string> = {
  ownership: "bg-emerald-100 text-emerald-900",
  zoning: "bg-indigo-100 text-indigo-900",
  proposal: "bg-amber-100 text-amber-900",
  hearing: "bg-sky-100 text-sky-900",
  legislation: "bg-rose-100 text-rose-900",
  enforcement: "bg-slate-200 text-slate-900",
  community: "bg-lime-100 text-lime-900",
};

export function TimelineEventCard({ event }: Props) {
  return (
    <article className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-semibold text-slate-700">{formatEventDate(event.date)}</p>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${eventColors[event.eventType]}`}>
          {event.eventType}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-slate-900">{event.title}</h3>
      <p className="mt-3 text-lg text-slate-600">{event.description}</p>
      {event.documents?.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Source documents</p>
          <ul className="space-y-1 text-base text-[#0b4f6c]">
            {event.documents.map((doc) => (
              <li key={doc.url}>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  {doc.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {event.tags?.length ? (
        <div className="mt-4">
          <TagList tags={event.tags} />
        </div>
      ) : null}
      {event.sourceUrl && (
        <p className="mt-4 text-sm text-[#0b4f6c]">
          Source: <a href={event.sourceUrl}>View record</a>
        </p>
      )}
    </article>
  );
}
