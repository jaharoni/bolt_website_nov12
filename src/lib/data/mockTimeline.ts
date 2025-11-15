import { TimelineEvent } from "@/lib/types";

export const mockTimeline: TimelineEvent[] = [
  {
    id: "1",
    title: "Jamesport Farm Zoning Update",
    date: "2024-09-12",
    description:
      "Riverhead Town Board votes to table the zoning update after residents request a new impact study focused on Sound Avenue traffic.",
    eventType: "zoning",
    tags: ["zoning", "sound avenue"],
    sourceUrl:
      "https://www.townofriverheadny.gov/AgendaCenter/ViewFile/Agenda/_09122024-1071",
    documents: [],
    status: "published",
  },
  {
    id: "2",
    title: "Planning Board Hearing Scheduled",
    date: "2024-10-02",
    description:
      "Public hearing scheduled for the revised Jamesport Gardens proposal. Meeting will include updated site plan and water usage projections.",
    eventType: "hearing",
    tags: ["planning board", "meeting"],
    documents: [],
    sourceUrl:
      "https://www.townofriverheadny.gov/AgendaCenter/ViewFile/Agenda/_10022024-1078",
    status: "published",
  },
  {
    id: "3",
    title: "Community Benefit Agreement Draft Released",
    date: "2024-11-05",
    description:
      "Developers release a community benefit agreement draft outlining funding for Jamesport Civic Association projects.",
    eventType: "development",
    tags: ["development", "agreement"],
    documents: [],
    status: "draft",
  },
];
