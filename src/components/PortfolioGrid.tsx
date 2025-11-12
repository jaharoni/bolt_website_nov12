export default function PortfolioGrid() {
  const works = [
    { title: "Brand Film", type: "Video", thumb: "/images/brandfilm.jpg" },
    { title: "Event Reel", type: "Video", thumb: "/images/eventreel.jpg" },
    { title: "Portrait Series", type: "Photo", thumb: "/images/portraits.jpg" },
    { title: "VFX Teaser", type: "VFX", thumb: "/images/vfxteaser.jpg" }
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Selected Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {works.map((w) => (
            <div key={w.title} className="rounded overflow-hidden shadow hover:shadow-lg transition">
              <img src={w.thumb} alt={w.title} className="w-full h-56 object-cover" />
              <div className="p-4 text-left">
                <h3 className="font-semibold">{w.title}</h3>
                <p className="text-sm text-gray-500">{w.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
