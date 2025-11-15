import { TimelineEvent, ScrapedUpdate } from "@/lib/types";
import { subDays } from "date-fns";

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "demo-1",
    date: subDays(new Date(), 5).toISOString(),
    title: "Town Board schedules special hearing on Route 25 parcels",
    description:
      "Riverhead Town Board added a special public hearing to review zoning clarifications for the former agricultural lots along Route 25.",
    eventType: "hearing",
    sourceUrl: "https://www.townofriverheadny.gov/AgendaCenter",
    tags: ["public-hearing", "route-25"],
    documents: [
      { label: "Draft agenda", url: "https://www.townofriverheadny.gov/DocumentCenter/View/1234" },
    ],
  },
  {
    id: "demo-2",
    date: subDays(new Date(), 15).toISOString(),
    title: "Developer submits revised concept for Youngs Avenue property",
    description:
      "Updated plan reduces traffic impact by consolidating driveways and adds a public walking path requested by residents.",
    eventType: "proposal",
    sourceUrl: "https://developer-site.example.com",
    tags: ["youngs-avenue", "mixed-use"],
    documents: [],
  },
  {
    id: "demo-3",
    date: subDays(new Date(), 42).toISOString(),
    title: "County records transfer of ownership for 1850 Main Rd",
    description: "Property transferred to Peconic Development LLC with stated intent to pursue agri-tourism zoning.",
    eventType: "ownership",
    sourceUrl: undefined,
    tags: ["land-transfer"],
    documents: [],
  },
];

export const mockScrapedUpdates: ScrapedUpdate[] = [
  {
    id: "mock-update-1",
    sourceUrl: "https://www.townofriverheadny.gov/calendar.aspx?EID=998",
    sourceLabel: "ZBA agenda",
    content: "Zoning Board meeting mentions Jamesport Design District variance.",
    detectedAt: new Date().toISOString(),
    processed: false,
    alertSent: false,
    keywords: ["variance", "Jamesport"],
  },
];
