import AdminStats from "@/components/admin/AdminStats";
import TimelineManager from "@/components/admin/TimelineManager";
import SubscribersTable from "@/components/admin/SubscribersTable";
import AdminActionsPanel from "@/components/admin/AdminActionsPanel";
import SummaryTool from "@/components/admin/SummaryTool";
import ScraperLog from "@/components/admin/ScraperLog";
import { fetchTimelineEvents } from "@/lib/db/timeline";
import { listResidents } from "@/lib/db/residents";
import { listScrapedUpdates } from "@/lib/db/scrapedUpdates";

export default async function AdminDashboard() {
  const [events, residents, updates] = await Promise.all([
    fetchTimelineEvents({ includeDrafts: true }),
    listResidents(),
    listScrapedUpdates(8),
  ]);

  const stats = {
    totalResidents: residents.length,
    confirmed: residents.filter((resident) => resident.confirmed).length,
    volunteers: residents.filter((resident) => resident.volunteerRole).length,
    totalEvents: events.length,
    drafts: events.filter((event) => event.status !== "published").length,
  };

  return (
    <div className="space-y-10">
      <AdminStats stats={stats} />
      <div className="grid gap-6 lg:grid-cols-3">
        <AdminActionsPanel />
        <SummaryTool />
        <ScraperLog updates={updates} />
      </div>
      <TimelineManager initialEvents={events} />
      <SubscribersTable residents={residents} />
    </div>
  );
}
