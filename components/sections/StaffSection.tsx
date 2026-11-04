import { staff, team } from "@/content/site";
import { Reveal } from "@/components/motion/Reveal";
import { StaffFlapWord } from "@/components/sections/StaffFlapWord";
import { StaffManifest } from "@/components/sections/StaffManifest";
import { StaffGrid } from "@/components/sections/StaffGrid";
import { StaffPass } from "@/components/sections/StaffPass";

/**
 * Staff, the third part of Inside TGVA — "the people behind all of it".
 *
 * Its own two columns under the chapters above, on the same 4:6 split: the
 * heading, a line on who the staff are and "View all staff" on the left,
 * holding still on a wide screen while the passes go by on the right. The
 * block shows the first few passes; the full roster is the General
 * Declaration the button opens, which is also where a growing team goes
 * without growing the page.
 */
export function StaffSection() {
  /* The edition is the year the page was built — the year this manifest was
     issued — so it moves on with the next deploy rather than going stale. */
  const edition = new Date().getFullYear();

  return (
    <section id="staff" aria-labelledby="staff-heading" className="tgva-staff mx-auto mt-28 max-w-[1240px]">
      <div className="tgva-staff-intro">
        <Reveal>
          <p className="font-display text-[11.5px] font-bold tracking-[0.26em] text-brand-light">
            {staff.eyebrow}
          </p>
        </Reveal>
        <Reveal index={1} className="mt-4">
          <p aria-hidden className="tgva-staff-lead">
            {staff.lead}
          </p>
          <StaffFlapWord word={staff.word} label={`${staff.lead} ${staff.word.toLowerCase()}`} />
        </Reveal>
        <Reveal index={2} className="mt-6">
          <div aria-hidden className="tgva-staff-rule">
            <b />
            <i />
          </div>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.75] text-ink-soft text-pretty">
            {staff.description}
          </p>
          <div className="mt-7">
            <StaffManifest members={team} edition={edition} />
          </div>
        </Reveal>
      </div>

      <StaffGrid>
        {team.slice(0, staff.shown).map((member, i) => (
          <StaffPass key={member.role} member={member} index={i} />
        ))}
      </StaffGrid>
    </section>
  );
}
