import OpenAI from "openai";
import { summarizationSchema } from "@/lib/validators/schemas";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

export async function summarizeDocument(input: unknown) {
  const payload = summarizationSchema.parse(input);

  if (!client) {
    return {
      summary: payload.content.slice(0, 280) + "...",
      tone: payload.audience,
    };
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You summarize municipal meeting documents into plain-English briefings for Long Island residents. Focus on actionable impacts.",
      },
      {
        role: "user",
        content: `Source URL: ${payload.sourceUrl}\nAudience: ${payload.audience}\nFocus: ${payload.focus.join(
          ", "
        )}\nDocument:\n${payload.content}`,
      },
    ],
  });

  const message = (response.output as Array<{ content?: Array<{ text?: string }> }> | undefined)?.[0];

  const summary =
    message?.content?.map((chunk) => chunk.text ?? "").join(" ").trim() ||
    "Summary unavailable. Please try again.";

  return {
    summary,
    tone: payload.audience,
  };
}
