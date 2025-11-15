"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/lib/repositories/timelineRepository";
import { summarizeDocument } from "@/lib/ai/summarize";
import { createAdminSession, clearAdminSession } from "@/lib/auth/adminSession";
import type { EventCategory } from "@/lib/types";

export type SummaryFormState = {
  summary: string;
  tokens: number;
  error?: string;
};

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(5),
  description: z.string().min(10),
  date: z.string(),
  eventType: z.string(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
});

export async function saveTimelineEvent(_: unknown, formData: FormData) {
  const parsed = eventSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    eventType: formData.get("eventType"),
    sourceUrl: formData.get("sourceUrl") || undefined,
    tags: formData.get("tags") || undefined,
  });

  const payload = {
    date: parsed.date,
    title: parsed.title,
    description: parsed.description,
    eventType: parsed.eventType as EventCategory,
    sourceUrl: parsed.sourceUrl || undefined,
    documents: [],
    tags: parsed.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
  };

  if (parsed.id) {
    await updateTimelineEvent(parsed.id, payload);
  } else {
    await createTimelineEvent(payload);
  }

  revalidatePath("/admin");
}

export async function removeTimelineEvent(_: unknown, formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing id");
  await deleteTimelineEvent(id);
  revalidatePath("/admin");
}

const loginSchema = z.object({ password: z.string().min(4) });

export async function adminLogin(_: unknown, formData: FormData) {
  const data = loginSchema.parse({ password: formData.get("password") });
  if (!process.env.ADMIN_DASHBOARD_PASSWORD) {
    throw new Error("Admin password not configured");
  }
  if (data.password !== process.env.ADMIN_DASHBOARD_PASSWORD) {
    throw new Error("Incorrect password");
  }
  await createAdminSession();
  revalidatePath("/admin");
}

export async function adminLogout() {
  clearAdminSession();
}

export async function generateSummaryAction(
  prevState: SummaryFormState,
  formData: FormData
): Promise<SummaryFormState> {
  void prevState;
  const documentText = formData.get("documentText");
  const context = formData.get("context");
  if (typeof documentText !== "string" || !documentText.trim()) {
    return { summary: "", tokens: 0, error: "Please paste the document text." };
  }
  try {
    const result = await summarizeDocument(documentText, typeof context === "string" ? context : undefined);
    return { summary: result.summary, tokens: result.tokensUsed };
  } catch (error) {
    console.error("summary error", error);
    return { summary: "", tokens: 0, error: "Unable to summarize. Check OPENAI_API_KEY." };
  }
}
