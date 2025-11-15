import { ScrapedUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils/date";

const ScraperLog = ({ updates }: { updates: ScrapedUpdate[] }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-xl font-semibold text-brand-primary">Scraper log</h3>
    <ol className="mt-4 space-y-4">
      {updates.map((update) => (
        <li key={update.id} className="border-b border-slate-100 pb-3">
          <p className="text-sm text-slate-500">
            {formatDate(update.detectedAt)} — {update.matchedKeywords.join(", ")}
          </p>
          <p className="text-brand-primary font-semibold">{update.content}</p>
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-primary underline"
          >
            View source
          </a>
        </li>
      ))}
      {updates.length === 0 && (
        <p className="text-slate-600">No scraper activity yet.</p>
      )}
    </ol>
  </div>
);

export default ScraperLog;
