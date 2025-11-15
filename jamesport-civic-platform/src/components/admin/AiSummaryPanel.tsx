"use client";

import { useActionState } from "react";
import { generateSummaryAction, type SummaryFormState } from "@/app/admin/actions";

const initialState: SummaryFormState = { summary: "", tokens: 0 };

export function AiSummaryPanel() {
  const [state, action, pending] = useActionState(generateSummaryAction, initialState);

  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <h2 className="text-2xl font-semibold text-slate-900">AI zoning summary</h2>
      <p className="text-slate-600">Paste agenda text and generate a plain-English recap.</p>
      <form action={action} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Document context
          <input name="context" className="mt-1 w-full rounded-xl border border-slate-300 p-3" placeholder="e.g., Planning Board agenda item #4" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Document text
          <textarea
            name="documentText"
            rows={6}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 p-3"
            placeholder="Paste zoning language or meeting minutes here"
          />
        </label>
        <button type="submit" disabled={pending} className="rounded-full bg-[#0b4f6c] px-4 py-2 font-semibold text-white">
          {pending ? "Summarizing..." : "Generate summary"}
        </button>
      </form>
      {state.error && <p className="mt-3 text-sm text-rose-600">{state.error}</p>}
      {state.summary && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Draft summary</p>
          <p className="mt-2 whitespace-pre-line text-slate-800">{state.summary}</p>
          <p className="mt-3 text-xs text-slate-500">Tokens used: {state.tokens}</p>
        </div>
      )}
    </section>
  );
}
