const stats = [
  { label: "Riverhead sources monitored", value: "7" },
  { label: "Historical events logged", value: "63" },
  { label: "Avg. alert turnaround", value: "2.5 hrs" },
  { label: "Volunteer network", value: "112 neighbors" },
];

export function ImpactStats() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-6">
              <p className="text-4xl font-bold text-[#0b4f6c]">{stat.value}</p>
              <p className="mt-2 text-base font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
