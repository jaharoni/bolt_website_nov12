import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle,
  ClipboardList,
  Globe2,
  Link as LinkIcon,
  Mail,
  MapPin,
  Megaphone,
  ShieldCheck,
  Siren,
} from "lucide-react";
import SEO from "../components/SEO";

interface UpdateItem {
  title: string;
  status: "ready" | "building" | "research";
  summary: string;
  date: string;
  link?: string;
}

const updates: UpdateItem[] = [
  {
    title: "Parcel watchlist: SCTM 0600-068-00-04-00-002-000",
    status: "ready",
    summary:
      "Parcel profile drafted with quick facts, GPS pin, and contact-ready talking points for anyone east of 105 explaining why this site matters.",
    date: "Updated March 2025",
  },
  {
    title: "Meeting radar + alerts",
    status: "building",
    summary:
      "Hooking into Riverhead Town Board and Planning Board agendas to auto-flag when the parcel shows up and generate plain-language briefs.",
    date: "Shipping beta April 2025",
    link: "https://www.townofriverheadny.gov/",
  },
  {
    title: "Evidence library",
    status: "research",
    summary:
      "Designing a shared repository for photos, FOIL responses, site plan PDFs, and groundwater notes so neighbors can skim without jargon.",
    date: "In user discovery",
  },
];

const actionModules = [
  {
    title: "Orientation kit",
    icon: <BookOpen className="w-6 h-6" />,
    description:
      "Two-minute explainer of what the parcel is, who decides, and the next public checkpoints. Perfect for forwarding to curious neighbors.",
  },
  {
    title: "Decision timeline",
    icon: <CalendarClock className="w-6 h-6" />,
    description:
      "Calendar feed that maps hearings, comment deadlines, and site walks — with prep tasks baked in so everyone shows up prepared.",
  },
  {
    title: "Action center",
    icon: <ClipboardList className="w-6 h-6" />,
    description:
      "Guided calls-to-action: who to email, what to say, how to log issues like truck noise or lighting impacts east of 105.",
  },
  {
    title: "Signals + alerts",
    icon: <Siren className="w-6 h-6" />,
    description:
      "Text/email alerts when the parcel hits an agenda, when new documents drop, or when we need turnout for a meeting.",
  },
];

const intakeOptions = [
  {
    title: "Documents",
    description: "Upload PDFs, FOIL responses, or screenshots. We'll tag and summarize for the library.",
  },
  {
    title: "Observations",
    description: "Report trucks, noise, tree clearing, or groundwater concerns east of Route 105 with quick location pins.",
  },
  {
    title: "Questions",
    description: "Send the confusing stuff from meeting agendas so we can translate it to plain language.",
  },
];

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    zip: "",
    interest: "",
    preferredChannel: "email",
    role: "resident",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://riverhead-east-watch.local";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Local Government for Dummies — Riverhead East",
    url: siteUrl,
    description:
      "Local Government for Dummies for Riverhead east of Route 105: parcel watchlists, meeting briefs, alerts, and action guides.",
    sameAs: ["https://www.townofriverheadny.gov/"],
  };

  const updateBadge = (status: UpdateItem["status"]) => {
    const styles: Record<UpdateItem["status"], string> = {
      ready: "bg-emerald-500/20 text-emerald-100 border-emerald-500/50",
      building: "bg-blue-500/20 text-blue-100 border-blue-500/50",
      research: "bg-yellow-500/20 text-yellow-100 border-yellow-500/50",
    };

    const labels: Record<UpdateItem["status"], string> = {
      ready: "Live",
      building: "In build",
      research: "Research",
    };

    return (
      <span className={`text-xs px-3 py-1 rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("idle");
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      setFormStatus("error");
      return;
    }

    const emailValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(formData.email);
    if (!emailValid) {
      setFormError("Enter a valid email address.");
      setFormStatus("error");
      return;
    }

    setFormStatus("success");
    setFormData({ name: "", email: "", zip: "", interest: "", preferredChannel: "email", role: "resident" });
  };

  return (
    <>
      <SEO
        title="Local Government for Dummies — Riverhead East"
        description="A purpose-built civic app that translates Riverhead east-of-105 activity into simple steps, alerts, and resources for neighbors."
        keywords={["Riverhead", "Route 105", "civic tech", "community action", "SCTM 0600-068-00-04-00-002-000", "local government for dummies"]}
        url={siteUrl}
        structuredData={structuredData}
      />

      <div className="relative z-10 min-h-screen pb-16 px-4 pt-32">
        <div className="max-w-6xl mx-auto flex items-center min-h-[calc(100vh-8rem)]">
          <div className="w-full space-y-12">
            <div
              className={`glass-card p-8 md:p-12 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex items-center gap-3 text-yellow-200/90 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <p className="uppercase tracking-[0.3em] text-xs font-semibold">Local Government for Dummies</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white/95 leading-tight mb-6 text-smart-contrast">
                A civic control center for neighbors east of Route 105.
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl">
                Everything needed to understand and act on Riverhead land-use decisions — starting with parcel SCTM 0600-068-00-04-00-002-000 — in a single place: explainers, alerts, action steps, and a growing evidence library.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="glass-card border border-white/10 p-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-200" />
                  <div>
                    <p className="text-sm text-white/60">Parcel focus</p>
                    <p className="text-lg text-white/90 font-medium">SCTM 0600-068-00-04-00-002-000</p>
                  </div>
                </div>
                <div className="glass-card border border-white/10 p-4 flex items-start gap-3">
                  <Megaphone className="w-5 h-5 text-yellow-200" />
                  <div>
                    <p className="text-sm text-white/60">Next checkpoints</p>
                    <p className="text-lg text-white/90 font-medium">Town & Planning Board agendas + hearings</p>
                  </div>
                </div>
                <div className="glass-card border border-white/10 p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-yellow-200" />
                  <div>
                    <p className="text-sm text-white/60">Stay updated</p>
                    <p className="text-lg text-white/90 font-medium">Email or SMS digests tailored to your role</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href="https://www.townofriverheadny.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary glass-button-enhanced inline-flex items-center gap-2"
                >
                  View Riverhead Town site
                  <LinkIcon className="w-4 h-4" />
                </a>
                <Link to="/contact" className="btn-secondary glass-button-enhanced">
                  Share a tip or concern
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-yellow-200" />
                  <h2 className="text-2xl text-white/90 font-semibold">Build status</h2>
                </div>
                <div className="space-y-4">
                  {updates.map((item, index) => (
                    <div
                      key={item.title}
                      className={`glass-card p-6 border border-white/10 transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                      }`}
                      style={{ transitionDelay: `${150 + index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {updateBadge(item.status)}
                          <p className="text-sm text-white/60">{item.date}</p>
                        </div>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-yellow-200 hover:text-yellow-100 inline-flex items-center gap-2"
                          >
                            Open source <LinkIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <h3 className="text-xl text-white/95 font-semibold mb-2">{item.title}</h3>
                      <p className="text-white/80 leading-relaxed">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-5 h-5 text-yellow-200" />
                    <h3 className="text-lg text-white/90 font-semibold">Product modules</h3>
                  </div>
                  <div className="space-y-4 text-white/80">
                    {actionModules.map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="mt-1 text-yellow-200">{item.icon}</div>
                        <div>
                          <p className="text-white/95 font-semibold">{item.title}</p>
                          <p className="text-sm text-white/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-5 h-5 text-yellow-200" />
                    <h3 className="text-lg text-white/90 font-semibold">Get updates</h3>
                  </div>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                    <label className="block text-sm text-white/70 mb-1" htmlFor="name">Name</label>
                    <input
                      id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                    <label className="block text-sm text-white/70 mb-1" htmlFor="email">Email</label>
                    <input
                      id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-white/70 mb-1" htmlFor="zip">ZIP (optional)</label>
                        <input
                          id="zip"
                          type="text"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          className="w-full glass-input px-4 py-3 text-white placeholder-white/50"
                          placeholder="11901"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1" htmlFor="interest">Focus</label>
                        <select
                          id="interest"
                          value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          className="w-full select-glass-dark px-4 py-3 text-white"
                        >
                          <option value="">Select</option>
                          <option value="alerts">Meeting & agenda alerts</option>
                          <option value="organizing">Neighborhood organizing</option>
                          <option value="research">Research & document tagging</option>
                          <option value="contributor">Product contributor</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-white/70 mb-1" htmlFor="channel">Preferred updates</label>
                        <select
                          id="channel"
                          value={formData.preferredChannel}
                          onChange={(e) => setFormData({ ...formData, preferredChannel: e.target.value })}
                          className="w-full select-glass-dark px-4 py-3 text-white"
                        >
                          <option value="email">Email digests</option>
                          <option value="sms">SMS alerts</option>
                          <option value="both">Email + SMS</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1" htmlFor="role">I’m a…</label>
                        <select
                          id="role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full select-glass-dark px-4 py-3 text-white"
                        >
                          <option value="resident">Neighbor east of 105</option>
                          <option value="business">Local business</option>
                          <option value="reporter">Reporter / blogger</option>
                          <option value="advocate">Advocate / organizer</option>
                        </select>
                      </div>
                    </div>
                    {formError && <p className="text-sm text-red-200">{formError}</p>}
                    {formStatus === "success" && (
                      <div className="flex items-center gap-2 text-emerald-200 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>You’re on the list. We’ll email updates soon.</span>
                      </div>
                    )}
                    <button type="submit" className="w-full btn-primary glass-button-enhanced">Notify me</button>
                  </form>
                </div>

                <div className="glass-card p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <LinkIcon className="w-5 h-5 text-yellow-200" />
                    <h3 className="text-lg text-white/90 font-semibold">Quick resources</h3>
                  </div>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start gap-2">
                      <CalendarClock className="w-4 h-4 text-yellow-200" />
                      <div>
                        <p className="text-white/90">Town of Riverhead meeting calendar</p>
                        <a
                          href="https://www.townofriverheadny.gov/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-yellow-200 hover:text-yellow-100 inline-flex items-center gap-1"
                        >
                          Open site <LinkIcon className="w-3 h-3" />
                        </a>
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-200" />
                      <span>Parcel ID: 0600-068-00-04-00-002-000</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-200" />
                      <span>Collecting traffic, groundwater, and noise observations</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-yellow-200" />
                    <h3 className="text-lg text-white/90 font-semibold">Submission intake</h3>
                  </div>
                  <p className="text-white/75 mb-4">
                    A simple, safe intake flow for neighbors to send documents, photos, or concerns. We triage and return plain-language summaries.
                  </p>
                  <div className="space-y-3">
                    {intakeOptions.map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-yellow-200" />
                        <div>
                          <p className="text-white/90 font-semibold">{item.title}</p>
                          <p className="text-sm text-white/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe2 className="w-5 h-5 text-yellow-200" />
                    <h3 className="text-lg text-white/90 font-semibold">Where this is headed</h3>
                  </div>
                  <p className="text-white/75 mb-3">
                    The goal: a replicable “Local Government for Dummies” stack any civic group can fork. Riverhead east-of-105 is the pilot.
                  </p>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-yellow-200" />Reusable parcel templates with timeline + decision-makers.</li>
                    <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-yellow-200" />Supabase-backed intake + notifications for documents and observations.</li>
                    <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-yellow-200" />Shareable briefs so residents can understand meetings in minutes.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
