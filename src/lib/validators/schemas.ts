import { z } from "zod";
import { EventType } from "@/lib/types";

export const timelineEventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(4).max(180),
  description: z.string().min(10),
  date: z.string(),
  eventType: z.custom<EventType>(),
  tags: z.array(z.string()).default([]),
  sourceUrl: z.string().url().optional(),
  documents: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    )
    .optional()
    .default([]),
  location: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const alertPreferencesSchema = z.object({
  generalUpdates: z.boolean().default(true),
  meetingAlerts: z.boolean().default(true),
  volunteerOpportunities: z.boolean().default(false),
  smsOptIn: z.boolean().default(false),
  keywords: z.array(z.string()).max(5).default([]),
});

export const registrationSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name."),
    email: z.string().email("Enter a valid email."),
    phone: z
      .string()
      .regex(/^[0-9()+\\-\\s]*$/, "Phone can only include numbers and symbols.")
      .optional()
      .or(z.literal("")),
    volunteerRole: z.string().optional(),
    alertPrefs: alertPreferencesSchema,
  })
  .refine(
    (data) => data.alertPrefs.generalUpdates || data.alertPrefs.meetingAlerts,
    {
      message: "Select at least one alert preference.",
      path: ["alertPrefs"],
    }
  );

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const summarizationSchema = z.object({
  sourceUrl: z.string().url(),
  content: z.string().min(50),
  audience: z.enum(["residents", "board", "volunteers"]).default("residents"),
  focus: z
    .array(z.string())
    .max(5)
    .default(["timeline impacts", "zoning changes"]),
});
