export default function Services() {
  const services = [
    {
      title: "Video Production",
      desc: "End-to-end production from pre-vis to final delivery for branded, editorial, and doc-style content."
    },
    {
      title: "Photography",
      desc: "On-location and studio photography — lifestyle, event, culinary, and portrait work."
    },
    {
      title: "Visual Effects",
      desc: "Motion graphics, compositing, and AI-enhanced post-production for seamless polish."
    }
  ]

  return (
    <section className="py-20 px-6 bg-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s) => (
            <div key={s.title} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
