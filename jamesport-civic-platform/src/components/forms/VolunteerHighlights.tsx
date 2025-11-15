export function VolunteerHighlights() {
  const opportunities = [
    {
      title: "Meeting Rapid Response",
      description: "Monitor agendas and prep talking points within 24 hours of a new posting.",
    },
    {
      title: "Property Research Squad",
      description: "Track deeds, zoning overlays, and environmental impact statements.",
    },
    {
      title: "Neighbor Outreach",
      description: "Deliver door hangers, organize phone trees, and support seniors who need assistance attending hearings.",
    },
  ];

  return (
    <section id="volunteer" className="bg-[#fdf7ec]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Community power</p>
        <h2 className="mt-2 text-4xl font-semibold text-amber-900">Volunteer committees</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {opportunities.map((item) => (
            <article key={item.title} className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-amber-900">{item.title}</h3>
              <p className="mt-3 text-lg text-amber-700">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
