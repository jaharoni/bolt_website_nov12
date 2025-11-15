type Props = {
  stats: {
    totalResidents: number;
    confirmed: number;
    volunteers: number;
    totalEvents: number;
    drafts: number;
  };
};

const cards = [
  { label: "Subscribers", key: "totalResidents" },
  { label: "Confirmed", key: "confirmed" },
  { label: "Volunteers", key: "volunteers" },
  { label: "Timeline events", key: "totalEvents" },
  { label: "Drafts", key: "drafts" },
] as const;

const AdminStats = ({ stats }: Props) => (
  <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
    {cards.map((card) => (
      <div
        key={card.key}
        className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {card.label}
        </p>
        <p className="mt-3 text-3xl font-bold text-brand-primary">
          {stats[card.key]}
        </p>
      </div>
    ))}
  </section>
);

export default AdminStats;
