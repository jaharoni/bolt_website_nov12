export type EventType =
  | "ownership"
  | "zoning"
  | "development"
  | "hearing"
  | "legislation"
  | "meeting"
  | "document";

export interface SourceDocument {
  title: string;
  url: string;
  uploadedPath?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  eventType: EventType;
  tags: string[];
  sourceUrl?: string;
  documents: SourceDocument[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "draft" | "published" | "archived";
  location?: string;
  legislationId?: string;
}

export interface AlertPreferences {
  generalUpdates: boolean;
  meetingAlerts: boolean;
  volunteerOpportunities: boolean;
  smsOptIn: boolean;
  keywords: string[];
}

export interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  volunteerRole?: string;
  alertPrefs: AlertPreferences;
  createdAt?: string;
  confirmed: boolean;
}

export interface ScrapedUpdate {
  id: string;
  sourceUrl: string;
  content: string;
  detectedAt: string;
  processed: boolean;
  alertSent: boolean;
  matchedKeywords: string[];
  meetingDate?: string;
}

export interface AdminSession {
  isLoggedIn: boolean;
  adminId?: string;
  email?: string;
  role?: "editor" | "manager" | "super_admin";
}

export interface MeetingDetectionResult {
  url: string;
  title: string;
  publishedAt: string;
  matchedKeywords: string[];
  summary?: string;
}
