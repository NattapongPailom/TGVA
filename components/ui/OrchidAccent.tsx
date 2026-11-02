import Image from "next/image";

/**
 * The Thai orchid, as a watermark. It bookends the page: one opens the hero
 * card, one closes the invitation, each tucked into a corner and cropped by it,
 * so it frames the block rather than sitting in it.
 *
 * Purely decorative — no alt, hidden from assistive tech, and it never takes a
 * click. The frame is the block's own size and clips the flower to the block's
 * edge; the block's content must be positioned to paint above it.
 */
export function OrchidAccent({ placement }: { placement: "hero" | "join" }) {
  return (
    <div aria-hidden className={`tgva-orchid tgva-orchid--${placement}`}>
      <Image src="/images/flower/orchid.png" alt="" width={358} height={363} />
    </div>
  );
}
