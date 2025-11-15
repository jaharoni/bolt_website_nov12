import { RegistrationForm } from "@/components/forms/RegistrationForm";

export function AlertSignupSection() {
  return (
    <section id="alerts" className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Stay informed</p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900">Email & SMS registration</h2>
          <p className="mt-3 text-lg text-slate-600">
            Sign up for double opt-in alerts covering planning board agendas, zoning updates, and volunteer opportunities.
          </p>
          <ul className="mt-6 space-y-3 text-lg text-slate-700">
            <li>• Double opt-in email confirmation to protect your inbox.</li>
            <li>• Phone optional; SMS reserved for urgent meeting changes.</li>
            <li>• Exportable list for administrators with one click.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-6 shadow-sm">
          <RegistrationForm />
        </div>
      </div>
    </section>
  );
}
