import { contactEmail, townName, appName } from "@/lib/config/appConfig";
import Link from "next/link";

type Props = {
  stats: {
    total: number;
    confirmed: number;
    volunteers: number;
  };
};

const HeroSection = ({ stats }: Props) => {
  return (
    <section className="bg-white shadow-card rounded-3xl px-8 py-12">
      <p className="uppercase text-sm tracking-[0.3em] text-brand-primary font-semibold">
        Jamesport Civic Association
      </p>
      <h1 className="mt-4 text-4xl lg:text-5xl font-semibold leading-snug text-brand-primary">
        {appName}: Transparency for{" "}
        <span className="text-accent-500">{townName}</span> development.
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-3xl">
        Track property history, understand zoning changes, and know when meetings
        are scheduled — with alerts built for residents and volunteers who want
        to stay informed without digging through endless PDFs.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="#register"
          className="inline-flex items-center rounded-full bg-brand-primary px-8 py-3 text-white text-lg font-semibold shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand-secondary"
        >
          Sign up for alerts
        </Link>
        <a
          href={`mailto:${contactEmail}`}
          className="inline-flex items-center rounded-full border border-brand-primary px-8 py-3 text-brand-primary text-lg font-semibold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand-secondary"
        >
          Contact the board
        </a>
      </div>
      <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
          <dt className="text-sm font-semibold text-slate-600">
            Residents subscribed
          </dt>
          <dd className="text-3xl font-bold text-brand-primary">
            {stats.total}+{" "}
            <span className="text-base font-medium text-slate-500">neighbors</span>
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
          <dt className="text-sm font-semibold text-slate-600">
            Confirmed subscribers
          </dt>
          <dd className="text-3xl font-bold text-brand-primary">
            {stats.confirmed}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
          <dt className="text-sm font-semibold text-slate-600">
            Active volunteers
          </dt>
          <dd className="text-3xl font-bold text-brand-primary">
            {stats.volunteers}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default HeroSection;
