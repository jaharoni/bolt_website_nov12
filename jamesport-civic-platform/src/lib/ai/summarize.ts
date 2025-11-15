import OpenAI from "openai";
import { serverEnv } from "@/lib/env";

const client = serverEnv.OPENAI_API_KEY ? new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY }) : null;

export async function summarizeDocument(text: string, context?: string) {
  if (!client) {
    return {
      summary:
        "AI summarization is not configured. Provide an OPENAI_API_KEY to enable automated summaries.",
      tokensUsed: 0,
    };
  }

  const prompt = `You are assisting the Jamesport Civic Platform. Provide a plain-English summary (max 180 words) highlighting zoning implications and community actions. Context: ${context ?? "none"}. Document: ${text}`;

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const summary = completion.output?.[0]?.content?.[0]?.text ?? "Summary unavailable.";
  return {
    summary,
    tokensUsed: completion.usage?.total_tokens ?? 0,
  };
}
