"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { alertPreferenceDefaults } from "@/lib/config/platform";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  volunteerRole: z.string().optional(),
  committeeInterest: z.string().optional(),
  general: z.boolean().default(true),
  meetings: z.boolean().default(true),
  volunteer: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export function RegistrationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      volunteerRole: "",
      committeeInterest: "",
      general: alertPreferenceDefaults.general,
      meetings: alertPreferenceDefaults.meetings,
      volunteer: alertPreferenceDefaults.volunteer,
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          volunteerRole: values.volunteerRole,
          committeeInterest: values.committeeInterest,
          alertPrefs: {
            general: values.general,
            meetings: values.meetings,
            volunteer: values.volunteer,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit registration. Please try again.");
      }

      setStatus("success");
      setMessage("Thanks for signing up! Please confirm via the email we just sent you.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} aria-label="Alert registration form">
      <div>
        <label className="text-base font-semibold text-slate-700" htmlFor="name">
          Full name
        </label>
        <Input id="name" aria-required {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-rose-600">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="text-base font-semibold text-slate-700" htmlFor="email">
          Email address
        </label>
        <Input id="email" type="email" aria-required {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="text-base font-semibold text-slate-700" htmlFor="phone">
          Phone (optional for SMS alerts)
        </label>
        <Input id="phone" type="tel" {...form.register("phone")} />
      </div>
      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="text-base font-semibold text-slate-700">Alert preferences</legend>
        <div className="mt-3 space-y-3 text-lg text-slate-600">
          <label className="flex items-center gap-3">
            <Checkbox {...form.register("general")} checked={form.watch("general")} />
            General updates (monthly digest)
          </label>
          <label className="flex items-center gap-3">
            <Checkbox {...form.register("meetings")} checked={form.watch("meetings")} />
            Meeting alerts (emails when new agendas drop)
          </label>
          <label className="flex items-center gap-3">
            <Checkbox {...form.register("volunteer")} checked={form.watch("volunteer")} />
            Volunteer opportunities (tabling, canvassing, research)
          </label>
        </div>
      </fieldset>
      <div>
        <label className="text-base font-semibold text-slate-700" htmlFor="volunteerRole">
          Volunteer role interest
        </label>
        <Input id="volunteerRole" placeholder="e.g., Research, Events, Communications" {...form.register("volunteerRole")} />
      </div>
      <div>
        <label className="text-base font-semibold text-slate-700" htmlFor="committeeInterest">
          Committee or skill you can share
        </label>
        <Input id="committeeInterest" placeholder="Planning board notes, letter writing, photography" {...form.register("committeeInterest")} />
      </div>
      <p className="text-sm text-slate-500">
        By submitting, you consent to receive civic updates per your selections. A confirmation email will finalize your subscription.
      </p>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Sign up for alerts"}
      </Button>
      {message && (
        <p className={status === "success" ? "text-emerald-700" : "text-rose-600"}>{message}</p>
      )}
    </form>
  );
}
