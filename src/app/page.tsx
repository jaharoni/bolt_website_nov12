import HeroSection from "@/components/home/HeroSection";
import TimelineShowcase from "@/components/home/TimelineShowcase";
import RegistrationPanel from "@/components/home/RegistrationPanel";
import MeetingFeed from "@/components/home/MeetingFeed";
import { fetchTimelineEvents } from "@/lib/db/timeline";
import { getResidentStats } from "@/lib/db/residents";
import { listScrapedUpdates } from "@/lib/db/scrapedUpdates";

export default async function Home() {
  const [events, stats, updates] = await Promise.all([
    fetchTimelineEvents(),
    getResidentStats(),
    listScrapedUpdates(5),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-5 py-10 lg:px-0">
      <HeroSection stats={stats} />
      <TimelineShowcase events={events} />
      <RegistrationPanel />
      <MeetingFeed updates={updates} />
    </main>
  );
}
