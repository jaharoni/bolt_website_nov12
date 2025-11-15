import { fetchScrapedUpdates } from "@/lib/repositories/scrapedUpdateRepository";

export default async function ScraperPage() {
  const updates = await fetchScrapedUpdates();

  return (
    <div>
      <h1 className="text-3xl font-semibold text-slate-900">Scraper activity</h1>
      <p className="text-slate-600">Riverhead meeting monitor status.</p>
      <div className="mt-6 space-y-4">
        {updates.map((update) => (
          <article key={update.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{new Date(update.detectedAt).toLocaleString()}</p>
            <h2 className="text-xl font-semibold text-slate-900">{update.sourceLabel ?? "New posting"}</h2>
            <p className="mt-2 text-slate-700">{update.content}</p>
            <p className="mt-2 text-sm text-slate-500">Keywords: {update.keywords.join(", ") || "—"}</p>
            <div className="mt-2 text-sm">
              <span className="mr-3 rounded-full bg-slate-100 px-3 py-1">
                Processed: {update.processed ? "Yes" : "No"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Alert sent: {update.alertSent ? "Yes" : "No"}
              </span>
            </div>
            <a className="mt-2 inline-block text-sm text-[#0b4f6c]" href={update.sourceUrl}>
              View source
            </a>
          </article>
        ))}
        {!updates.length && <p>No scraper updates logged.</p>}
      </div>
    </div>
  );
}
