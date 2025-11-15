import { confirmResident } from "@/lib/db/residents";

type Props = {
  searchParams: { token?: string };
};

export default async function ConfirmPage({ searchParams }: Props) {
  const token = searchParams.token;

  let title = "Confirmation link missing";
  let message =
    "We could not find a confirmation token. Please use the latest email we sent you.";
  let success = false;

  if (token) {
    try {
      await confirmResident(token);
      title = "You're all set!";
      message =
        "Thank you for confirming. You'll now receive Jamesport civic alerts.";
      success = true;
    } catch (error) {
      console.error(error);
      title = "Link expired or invalid";
      message =
        "Please request a new confirmation email or contact info@jamesportcivic.org.";
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="text-sm uppercase tracking-[0.3em] font-semibold text-slate-500">
        Email confirmation
      </p>
      <h1
        className={`text-4xl font-semibold ${
          success ? "text-brand-primary" : "text-amber-600"
        }`}
      >
        {title}
      </h1>
      <p className="text-lg text-slate-600">{message}</p>
    </main>
  );
}
