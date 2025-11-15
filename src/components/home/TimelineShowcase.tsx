import { TimelineEvent } from "@/lib/types";
import InteractiveTimeline from "@/components/home/InteractiveTimeline";

const TimelineShowcase = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <section className="bg-white rounded-3xl shadow-card px-8 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Property history
          </p>
          <h2 className="text-3xl font-semibold text-brand-primary">
            Interactive timeline for every Jamesport parcel.
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Filter ownership changes, zoning updates, proposals, and meeting
            dates. Each entry links back to source documents so neighbors can
            verify every claim.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold text-slate-500">Filters include</p>
          <p className="text-lg font-semibold text-brand-primary">
            Ownership · Zoning · Hearings · Legislation
          </p>
        </div>
      </div>
      <div className="mt-8">
        <InteractiveTimeline events={events} />
      </div>
    </section>
  );
};

export default TimelineShowcase;
