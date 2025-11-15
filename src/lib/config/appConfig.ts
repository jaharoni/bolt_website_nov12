export const townName =
  process.env.NEXT_PUBLIC_TOWN_NAME ?? "Jamesport, New York";

export const appName =
  process.env.NEXT_PUBLIC_APP_NAME ?? "Jamesport Civic Platform";

export const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@jamesportcivic.org";

export const keywords =
  process.env.SCRAPER_KEYWORDS?.split(",").map((k) => k.trim()) ?? [];
