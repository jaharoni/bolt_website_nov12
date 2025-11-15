export const PLATFORM_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Jamesport Civic Platform";
export const TOWN_NAME = process.env.NEXT_PUBLIC_TOWN_NAME ?? "Jamesport, NY";
export const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "jamesport";
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? "00000000-0000-0000-0000-000000000001";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "updates@jamesportcivic.org";
export const PRIMARY_COLOR = "#0b4f6c";
export const SECONDARY_COLOR = "#f5a524";

export const eventTypeOptions = [
  { value: "ownership", label: "Ownership" },
  { value: "zoning", label: "Zoning" },
  { value: "proposal", label: "Development Proposal" },
  { value: "hearing", label: "Public Hearing" },
  { value: "legislation", label: "Town Legislation" },
  { value: "enforcement", label: "Enforcement" },
  { value: "community", label: "Community Action" },
];

export const alertPreferenceDefaults = {
  general: true,
  meetings: true,
  volunteer: false,
};
