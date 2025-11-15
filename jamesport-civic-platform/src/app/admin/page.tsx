import { fetchTimeline } from "@/lib/repositories/timelineRepository";
import { eventTypeOptions } from "@/lib/config/platform";
import { saveTimelineEvent, removeTimelineEvent } from "@/app/admin/actions";
import { AiSummaryPanel } from "@/components/admin/AiSummaryPanel";

export default async function AdminDashboardPage() {
  const events = await fetchTimeline();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold text-slate-900">Timeline events</h1>
        <p className="text-slate-600">Create, edit, or remove development milestones.</p>
        <form action={saveTimelineEvent} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            Title
            <input name="title" required className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Event date
            <input type="date" name="date" required className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <label className="text-sm font-semibold text-slate-600 md:col-span-2">
            Description
            <textarea name="description" required rows={4} className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Event type
            <select name="eventType" className="mt-1 w-full rounded-xl border border-slate-300 p-3">
              {eventTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Source URL
            <input name="sourceUrl" className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <label className="text-sm font-semibold text-slate-600 md:col-span-2">
            Tags (comma separated)
            <input name="tags" className="mt-1 w-full rounded-xl border border-slate-300 p-3" placeholder="route-25, planning-board" />
          </label>
          <button type="submit" className="rounded-full bg-[#0b4f6c] px-6 py-3 font-semibold text-white">
            Save event
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Existing entries</h2>
        <div className="mt-4 space-y-4">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 p-4">
              <details>
                <summary className="cursor-pointer text-lg font-semibold text-slate-800">{event.title}</summary>
                <p className="mt-2 text-sm text-slate-500">
                  {event.eventType} • {new Date(event.date).toLocaleDateString()}
                </p>
                <form action={saveTimelineEvent} className="mt-4 grid gap-3">
                  <input type="hidden" name="id" value={event.id} />
                  <label className="text-sm font-semibold text-slate-600">
                    Title
                    <input name="title" defaultValue={event.title} className="mt-1 rounded-xl border border-slate-300 p-3" />
                  </label>
                  <label className="text-sm font-semibold text-slate-600">
                    Date
                    <input
                      name="date"
                      type="date"
                      defaultValue={event.date.split("T")[0]}
                      className="mt-1 rounded-xl border border-slate-300 p-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-600">
                    Description
                    <textarea
                      name="description"
                      defaultValue={event.description}
                      className="mt-1 rounded-xl border border-slate-300 p-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-600">
                    Event type
                    <select
                      name="eventType"
                      defaultValue={event.eventType}
                      className="mt-1 rounded-xl border border-slate-300 p-3"
                    >
                      {eventTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-600">
                    Source URL
                    <input name="sourceUrl" defaultValue={event.sourceUrl} className="mt-1 rounded-xl border border-slate-300 p-3" />
                  </label>
                  <label className="text-sm font-semibold text-slate-600">
                    Tags
                    <input
                      name="tags"
                      defaultValue={event.tags.join(", ")}
                      className="mt-1 rounded-xl border border-slate-300 p-3"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className="rounded-full bg-[#0b4f6c] px-4 py-2 text-sm font-semibold text-white">
                      Update
                    </button>
                  </div>
                </form>
                <form action={removeTimelineEvent} className="mt-2">
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                    Delete
                  </button>
                </form>
              </details>
            </article>
          ))}
          {!events.length && <p>No events yet.</p>}
        </div>
      </section>

      <AiSummaryPanel />
    </div>
  );
}
