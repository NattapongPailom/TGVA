import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { EventAnnouncement } from "@/components/sections/EventAnnouncement";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { OurStory } from "@/components/sections/OurStory";
import { DestinationTicker } from "@/components/sections/DestinationTicker";
import { InsideTgva } from "@/components/sections/InsideTgva";
import { SilkBand } from "@/components/sections/SilkBand";
import { WhereWeFly } from "@/components/sections/WhereWeFly";
import { OurFleet } from "@/components/sections/OurFleet";
import { JoinUs } from "@/components/sections/JoinUs";

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <SiteHeader />
      <EventAnnouncement />
      <main>
        <WhoWeAre />
        <OurStory />
        <DestinationTicker />
        <InsideTgva />
        <SilkBand />
        <WhereWeFly />
        <OurFleet />
      </main>

      {/* One stacking context for the two footer tiers, so Join Us can cover
          the detail sticking to the foot of the viewport beneath it. */}
      <div className="relative">
        <JoinUs />
        <SiteFooter />
      </div>
    </>
  );
}
