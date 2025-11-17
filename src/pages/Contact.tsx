import React, { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, Link as LinkIcon, Mail, MapPin, Send, Users, Waves } from "lucide-react";
import SEO from "../components/SEO";

const helpPaths = [
  {
    title: "Meeting prep",
    detail: "Need a quick brief or talking points before a Town or Planning Board meeting? We’ll draft it in plain language.",
  },
  {
    title: "Document intake",
    detail: "Send FOIL responses, PDFs, or screenshots tied to the parcel. We’ll tag, summarize, and add them to the library.",
  },
  {
    title: "On-the-ground reports",
    detail: "Truck traffic, tree clearing, lighting, odors — tell us what you’re seeing east of 105 so we can track impacts.",
  },
];

const quickLinks = [
  {
    label: "Riverhead Town site",
    href: "https://www.townofriverheadny.gov/",
    description: "Agendas, public notices, and meeting calendar",
  },
  {
    label: "Parcel ID",
    href: "https://www.townofriverheadny.gov/",
    description: "SCTM 0600-068-00-04-00-002-000 (focus parcel)",
  },
];

function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "resident",
    topic: "updates",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      setStatus("error");
      return;
    }

    const emailValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(formData.email);
    if (!emailValid) {
      setError("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("success");
    setFormData({ name: "", email: "", role: "resident", topic: "updates", message: "" });
  };

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://riverhead-east-watch.local";

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="Participate in the Riverhead pilot"
        description="Send observations, documents, or requests to the Local Government for Dummies team building the east-of-105 hub."
        keywords={["Riverhead", "Route 105", "contact", "civic tech", "alerts"]}
        url={`${siteUrl}/contact`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: `${siteUrl}/contact`,
          name: "Participate in the Local Government for Dummies pilot",
          description:
            "Get in touch to share observations, ask for briefs, or contribute documents about SCTM 0600-068-00-04-00-002-000.",
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-section-title text-white mb-6">Participate</h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Tell us what you’re seeing, send documents, or request meeting prep. This hub is built to make Riverhead’s process easy to follow for everyone east of Route 105.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <div
            className={`glass-card p-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <h2 className="text-card-title text-white mb-6">Send a note</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-nav text-white/80 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full glass-input glass-input-enhanced px-4 py-3 text-body text-white placeholder-white/60"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-nav text-white/80 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full glass-input glass-input-enhanced px-4 py-3 text-body text-white placeholder-white/60"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-nav text-white/80 mb-2">
                    I’m a…
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full select-glass-dark px-4 py-3 text-body text-white"
                  >
                    <option value="resident">Neighbor east of 105</option>
                    <option value="business">Local business</option>
                    <option value="reporter">Reporter / blogger</option>
                    <option value="official">Town stakeholder</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="topic" className="block text-nav text-white/80 mb-2">
                    What do you need?
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full select-glass-dark px-4 py-3 text-body text-white"
                    required
                  >
                    <option value="updates">Add me to alerts</option>
                    <option value="brief">Meeting prep / talking points</option>
                    <option value="documents">Share or request documents</option>
                    <option value="observation">Report an observation</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-nav text-white/80 mb-2">
                  Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full glass-input glass-input-enhanced px-4 py-3 text-body text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all resize-none"
                  placeholder="Share what you’re seeing, the meeting date you’re prepping for, or the document link."
                />
              </div>

              {error && <p className="text-sm text-red-200">{error}</p>}
              {status === "success" && <p className="text-sm text-emerald-200">Thanks. We’ll follow up shortly.</p>}

              <button
                type="submit"
                className="w-full btn-primary glass-button-enhanced flash-on-hover py-4 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div
              className={`glass-card p-8 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <h2 className="text-card-title text-white mb-6">How we help</h2>

              <div className="space-y-6 text-white/80">
                {helpPaths.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-yellow-200 mt-1" />
                    <div>
                      <p className="text-white/90 font-semibold">{item.title}</p>
                      <p className="text-sm">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`glass-card p-8 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <h2 className="text-card-title text-white mb-4">Quick references</h2>
              <div className="space-y-4">
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-white/85 hover:text-white"
                  >
                    <LinkIcon className="w-4 h-4 text-yellow-200" />
                    <div>
                      <p className="font-semibold text-white/95">{link.label}</p>
                      <p className="text-sm text-white/70">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div
              className={`glass-card p-8 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <h2 className="text-card-title text-white mb-4">What we’re tracking</h2>
              <div className="space-y-3 text-white/80 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-200 mt-1" />
                  <p>Parcel SCTM 0600-068-00-04-00-002-000 and any linked lots east of Route 105.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-yellow-200 mt-1" />
                  <p>Meeting agendas and public hearings that need turnout or comment submissions.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Waves className="w-4 h-4 text-yellow-200 mt-1" />
                  <p>Groundwater, traffic, and noise observations that neighbors report so we can log patterns.</p>
                </div>
              </div>
            </div>

            <div
              className={`glass-card p-8 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "700ms" }}
            >
              <h2 className="text-card-title text-white mb-4">Where to reach us</h2>
              <div className="space-y-4 text-white/80">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-yellow-200 mt-1" />
                  <div>
                    <p className="font-semibold text-white/90">Email</p>
                    <p className="text-sm">updates@riverheadeastwatch.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-200 mt-1" />
                  <div>
                    <p className="font-semibold text-white/90">Focus area</p>
                    <p className="text-sm">East of Route 105, Riverhead — parcel SCTM 0600-068-00-04-00-002-000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
