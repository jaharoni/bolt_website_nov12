import React, { useEffect, useState } from "react";
import { AlertTriangle, Book, CalendarRange, Compass, Cpu, MapPin, ShieldCheck, Users } from "lucide-react";
import SEO from "../components/SEO";

const playbook = [
  {
    title: "Translate government speak",
    description:
      "Every agenda item, memo, and FOIL response gets rewritten in plain English with the what, who, and why for east-of-105 neighbors.",
    icon: <Book className="w-6 h-6" />,
  },
  {
    title: "Track the timeline",
    description: "Hearings, comment windows, site walks, and decisions live on a single calendar with prep tasks attached.",
    icon: <CalendarRange className="w-6 h-6" />,
  },
  {
    title: "Collect evidence",
    description: "Photos, parcel documents, and resident observations feed an organized library so anyone can cite facts fast.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    title: "Mobilize quickly",
    description: "Templates, contact lists, and call-to-action buttons make it simple to show up, email, or testify with confidence.",
    icon: <Compass className="w-6 h-6" />,
  },
];

const coverage = [
  "Parcel spotlight: SCTM 0600-068-00-04-00-002-000 and nearby lots east of Route 105",
  "Traffic, groundwater, noise, and lighting impacts reported by neighbors",
  "Town Board, Planning Board, and Zoning Board activity tied to the parcel",
  "A repeatable civic stack that other communities can fork for their own parcels",
];

const buildTracks = [
  {
    label: "Data & intake",
    detail: "Supabase-backed submissions for documents, observations, and questions with tagging for quick triage.",
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    label: "Notifications",
    detail: "Role-based digests (resident, business, reporter) across email/SMS keyed to agendas and document drops.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    label: "Action kits",
    detail: "Reusable issue briefs, comment templates, and one-click contact sheets for decision makers.",
    icon: <Compass className="w-6 h-6" />,
  },
];

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://riverhead-east-watch.local";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Local Government for Dummies — About",
    description: "How the Local Government for Dummies pilot in Riverhead east of Route 105 works and where it is headed.",
    url: `${siteUrl}/about`,
    isPartOf: {
      "@type": "WebSite",
      name: "Local Government for Dummies — Riverhead East",
      url: siteUrl,
    },
    inLanguage: "en-US",
  };

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="About the Local Government for Dummies pilot"
        description="Why we are building a plain-language civic stack for Riverhead east of Route 105 and how it will serve neighbors."
        keywords={["Riverhead", "Route 105", "civic tech", "local government for dummies", "public hearings"]}
        url={`${siteUrl}/about`}
        structuredData={structuredData}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-section-title text-white/98 mb-4 text-smart-contrast">The pilot</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Riverhead east of Route 105 is our first deployment of a “Local Government for Dummies” stack. It centers on parcel SCTM 0600-068-00-04-00-002-000 and the neighbors who will live with the outcomes.
          </p>
        </div>

        <div
          className={`glass-card p-8 md:p-10 mb-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-start gap-4 mb-6">
            <ShieldCheck className="w-7 h-7 text-yellow-200" />
            <div>
              <h2 className="text-2xl text-white/95 mb-2">What it solves</h2>
              <p className="text-white/80 leading-relaxed">
                Residents shouldn’t need to decode legal notices to protect their neighborhood. This project centralizes every decision point, translates the jargon, and gives people east of 105 an actionable path to participate.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-7 h-7 text-yellow-200" />
            <div>
              <h3 className="text-xl text-white/90 mb-2">Where we focus first</h3>
              <p className="text-white/80 leading-relaxed">
                The parcel APN/SCTM 0600-068-00-04-00-002-000 and any linked lots east of Route 105. Traffic, groundwater, and neighborhood character are the core concerns we track.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {playbook.map((item, index) => (
            <div
              key={item.title}
              className={`glass-card p-6 glass-hover transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${150 + index * 80}ms` }}
            >
              <div className="text-yellow-200 mb-4">{item.icon}</div>
              <h3 className="text-lg text-white/95 mb-2">{item.title}</h3>
              <p className="text-white/80 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div
          className={`glass-card p-8 md:p-10 mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-yellow-200" />
            <h3 className="text-xl text-white/90">Scope</h3>
          </div>
          <ul className="space-y-3 text-white/80">
            {coverage.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-yellow-200/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`glass-card p-8 md:p-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-yellow-200" />
            <h3 className="text-xl text-white/90">Build plan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {buildTracks.map((item, index) => (
              <div
                key={item.label}
                className="glass-card p-6 border border-white/10"
                style={{ transitionDelay: `${150 + index * 80}ms` }}
              >
                <div className="flex items-center gap-2 mb-2 text-yellow-200">{item.icon}</div>
                <p className="text-lg text-white/95 font-semibold mb-2">{item.label}</p>
                <p className="text-white/75 leading-relaxed text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
