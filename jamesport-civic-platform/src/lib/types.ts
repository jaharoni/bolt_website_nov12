export type EventCategory =
  | "ownership"
  | "zoning"
  | "proposal"
  | "hearing"
  | "legislation"
  | "enforcement"
  | "community";

export type AlertPreferences = {
  general: boolean;
  meetings: boolean;
  volunteer: boolean;
};

export interface TimelineDocument {
  label: string;
  url: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  eventType: EventCategory;
  sourceUrl?: string;
  tags: string[];
  documents: TimelineDocument[];
  createdBy?: string;
}

export interface RegistrationPayload {
  name: string;
  email: string;
  phone?: string;
  volunteerRole?: string;
  committeeInterest?: string;
  alertPrefs: AlertPreferences;
  tenantSlug?: string;
}

export interface ScrapedUpdate {
  id: string;
  sourceUrl: string;
  sourceLabel?: string;
  content: string;
  detectedAt: string;
  processed: boolean;
  alertSent: boolean;
  keywords: string[];
}

export interface MeetingDetectionResult {
  url: string;
  title: string;
  scheduledFor?: string;
  matchedKeywords: string[];
  rawHtmlSnippet?: string;
}
