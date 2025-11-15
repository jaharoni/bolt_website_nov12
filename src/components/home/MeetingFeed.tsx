import { ScrapedUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils/date";

const MeetingFeed = ({ updates }: { updates: ScrapedUpdate[] }) => (
  <section className="bg-white rounded-3xl shadow-card p-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] font-semibold text-slate-500">
          Automated monitoring
        </p>
        <h2 className="text-3xl font-semibold text-brand-primary">
          Riverhead posting detector
        </h2>
        <p className="text-slate-600 mt-2">
          A Playwright-based watcher scans official calendars every 3 hours for
          keywords tied to Jamesport parcels.
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-500">Keywords</p>
        <p className="text-lg font-semibold text-brand-primary">
          {process.env.SCRAPER_KEYWORDS ?? "Jamesport, Sound Ave"}
        </p>
      </div>
    </div>
    <ol className="mt-6 space-y-4">
      {updates.map((update) => (
        <li
          key={update.id}
          className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-brand-primary">
              {formatDate(update.detectedAt)}
            </span>
            <span className="text-sm text-slate-500">
              {update.matchedKeywords.join(", ")}
            </span>
          </div>
          <p className="mt-2 text-slate-700">{update.content}</p>
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-brand-primary text-sm font-semibold underline"
          >
            View source
          </a>
        </li>
      ))}
      {updates.length === 0 && (
        <p className="text-slate-600">
          No detected meetings yet today. The scraper runs every few hours.
        </p>
      )}
    </ol>
  </section>
);

export default MeetingFeed;
