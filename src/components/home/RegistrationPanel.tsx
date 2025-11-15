import RegistrationForm from "@/components/forms/RegistrationForm";

const RegistrationPanel = () => (
  <section id="register" className="grid gap-10 lg:grid-cols-2 items-center">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Email & SMS Alerts
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-brand-primary">
        Confirmed alerts built for seniors and busy neighbors.
      </h2>
      <p className="mt-4 text-slate-600 text-lg">
        Double opt-in emails, SMS backup, and one dashboard for admins. Opt out
        anytime. Your contact info never leaves the civic association.
      </p>
      <ul className="mt-6 space-y-3 text-slate-600">
        <li>• Large-type emails readable on tablets.</li>
        <li>• Meeting alerts triggered within minutes of detection.</li>
        <li>• Volunteer opportunities routed to committee leads.</li>
      </ul>
    </div>
    <RegistrationForm />
  </section>
);

export default RegistrationPanel;
