import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, Users, Award, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { createWebPageSchema } from "../lib/structuredData";

function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    message: ''
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      detail: "contact@jaharoni.com",
      action: "mailto:contact@jaharoni.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      detail: "646.683.3939",
      action: "tel:+16466833939"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      detail: "Anywhere your story needs telling",
      action: null
    }
  ];

  const stats = [
    { icon: <Clock className="w-8 h-8" />, value: "24h", label: "Response Time" },
    { icon: <Users className="w-8 h-8" />, value: "500+", label: "Happy Clients" },
    { icon: <Award className="w-8 h-8" />, value: "Published", label: "Print & TV Media" },
    { icon: <Briefcase className="w-8 h-8" />, value: "Pro", label: "Experience" },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Initial Consultation",
      description: "We'll discuss your vision, goals, and project requirements in a free consultation."
    },
    {
      number: "02",
      title: "Proposal & Planning",
      description: "Receive a detailed proposal with timeline, deliverables, and custom pricing."
    },
    {
      number: "03",
      title: "Production",
      description: "Professional execution with regular updates and collaborative feedback loops."
    },
    {
      number: "04",
      title: "Delivery & Support",
      description: "High-quality final deliverables with post-project support and revisions."
    }
  ];

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://justinaharoni.com';

  return (
    <div className="relative min-h-screen pb-32 px-4 pt-32">
      <SEO
        title="Contact"
        description="Get in touch with Justin Aharoni for photography and filmmaking services. Available for commercial projects, event coverage, weddings, and custom commissions."
        keywords={['contact photographer', 'hire photographer', 'photography services', 'book photographer', 'commercial photography inquiry', 'wedding photographer contact']}
        url={`${siteUrl}/contact`}
        structuredData={createWebPageSchema(
          'Contact Justin Aharoni - Photography Services',
          'Get in touch for commercial photography, event coverage, and custom projects.',
          `${siteUrl}/contact`,
          [
            { name: 'Home', url: siteUrl },
            { name: 'Contact', url: `${siteUrl}/contact` }
          ]
        )}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-section-title text-white mb-6">
            Let's Connect
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            <span className="font-display text-xl text-white/90 tracking-wide">Got a vision that needs bringing to life?</span>
            <br />
            <span className="text-white/60 font-body text-base">Let's turn your wildest creative dreams into reality — because ordinary is not in my vocabulary.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Contact Form */}
          <div
            className={`glass-card p-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '200ms' }}>
            <h2 className="text-card-title text-white mb-6">Start a Conversation</h2>
            
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
                  className="w-full glass-input glass-input-enhanced px-4 py-3 text-body text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
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
                  className="w-full glass-input glass-input-enhanced px-4 py-3 text-body text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="project" className="block text-nav text-white/80 mb-2">
                  Project Type
                </label>
                <select
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleInputChange}
                  className="w-full select-glass-dark px-4 py-3 text-body text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a project type</option>
                  <option value="commercial">Commercial Photography</option>
                  <option value="events">Event Documentation</option>
                  <option value="essays">Photo Essays</option>
                  <option value="digital">Digital Media</option>
                  <option value="prints">Print Shop / Gallery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-nav text-white/80 mb-2">
                  Tell me about your project
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full glass-input glass-input-enhanced px-4 py-3 text-body text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all resize-none"
                  placeholder="Share your vision, timeline, and any specific requirements..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary glass-button-enhanced flash-on-hover py-4 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className={`glass-card p-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '400ms' }}>
              <h2 className="text-card-title text-white mb-6">Get In Touch</h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={info.title} className="flex items-start space-x-4">
                    <div className="text-white/80 mt-1">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-nav text-white mb-1">{info.title}</h3>
                      {info.action ? (
                        <a 
                          href={info.action}
                          className="text-body text-white/70 hover:text-white transition-colors"
                        >
                          {info.detail}
                        </a>
                      ) : (
                        <p className="text-body text-white/70">{info.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className={`glass-card p-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '600ms' }}>
              <h3 className="text-card-title text-white mb-4">What to Expect</h3>
              <div className="space-y-4 font-display text-base text-white/75 leading-relaxed">
                <p>• Response within 24 hours</p>
                <p>• Free initial consultation</p>
                <p>• Custom project proposals</p>
                <p>• Flexible scheduling options</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className={`glass-card p-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '800ms' }}>
              <h3 className="text-card-title text-white mb-4">Why Work With Me?</h3>
              <div className="space-y-3 font-display text-base text-white/75 leading-relaxed">
                <p>✓ Professional experience</p>
                <p>✓ Collaborative approach</p>
                <p>✓ Attention to detail</p>
                <p>✓ Swift execution that never compromises the vision</p>
              </div>

              <div className="mt-6 pt-4 border-t border-yellow-400/20">
                <Link to="/shop" className="cta-subtle hover:underline">
                  Browse available prints while you're here →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div
          className={`mt-20 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="text-center mb-12">
            <h2 className="text-section-title text-white mb-4">How We Work Together</h2>
            <p className="text-white/70 font-display text-lg">A simple, collaborative process from start to finish</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div
                key={step.number}
                className={`glass-card p-6 glass-hover card-hover transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${400 + index * 150}ms`
                }}
              >
                <div className="text-yellow-400/40 text-5xl font-display font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-card-title text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-body text-white/75 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className={`glass-card p-12 text-center mt-20 mb-24 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '1000ms' }}>
          <h2 className="text-section-title text-white mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-body-large text-white/80 mb-8 max-w-2xl mx-auto">
            Let's collaborate and bring your creative vision to life. Whether it's a commercial project, personal milestone, or artistic endeavor, I'm here to make it extraordinary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#top" className="btn-primary glass-button-enhanced">
              Send a Message
            </a>
            <Link to="/gallery" className="btn-secondary glass-button-enhanced">
              View My Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;