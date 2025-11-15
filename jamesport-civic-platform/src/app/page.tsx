import { fetchTimeline } from "@/lib/repositories/timelineRepository";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { TimelineSection } from "@/components/timeline/TimelineSection";
import { AlertSignupSection } from "@/components/forms/AlertSignupSection";
import { VolunteerHighlights } from "@/components/forms/VolunteerHighlights";
import { ImpactStats } from "@/components/layout/ImpactStats";
import { MonitoringExplainer } from "@/components/layout/MonitoringExplainer";

export default async function HomePage() {
  const events = await fetchTimeline();

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <SiteHeader />
      <main>
        <HeroBanner />
        <ImpactStats />
        <TimelineSection events={events} />
        <MonitoringExplainer />
        <AlertSignupSection />
        <VolunteerHighlights />
      </main>
      <SiteFooter />
    </div>
  );
}
