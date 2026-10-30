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
      {/* The order is the argument. A visitor who has never heard of TGVA is
          deciding whether the airline is real, so the evidence leads: the
          destinations are named, then the network is drawn from true
          coordinates, then its totals, then the story and the people — and the
          fleet last, drawn to published dimensions, as the final piece of proof
          before the invitation asks for anything.

          The fleet sits here for the grounds as much as the argument. It is the
          one Orchid Deep block in the second half, and without it the page ran
          white → white → white → white into the light closing block and then
          straight into the abyss footer. The last three blocks now alternate
          hard — deep, light, abyss — which is the strongest close the two
          grounds can make.

          The cost is that the summary band states the fleet's count before the
          fleet is shown. That reads as a figure the fleet then delivers on
          rather than one it has already earned; the destination and country
          counts still total what the map has just shown. */}
      <main id="main">
        <WhoWeAre />
        <DestinationTicker />
        <WhereWeFly />
        <SilkBand />
        <OurStory />
        <InsideTgva />
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
