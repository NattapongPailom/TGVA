import Image from "next/image";
import type { CSSProperties } from "react";
import { longest, tallest, typeByCode, type Aircraft } from "@/content/fleet";
import { AircraftSilhouette } from "@/components/sections/AircraftSilhouette";

/** Metres. The A330-300's length — the smallest any image is drawn. */
const SMALLEST_DRAWN = typeByCode("A333")?.length ?? 0;

/**
 * A type's full-colour image, or its silhouette where it has none.
 *
 * The frame is the silhouettes' own box — as wide as the longest type and as
 * tall as the tallest — so a list or a board keeps one height from type to
 * type. Inside it the image is sized by the type's length and lined up at the
 * nose, but never drawn smaller than the A330-300: to scale, the A320 and A321
 * came out too small to read. The fleet boards and the route ticket both draw
 * aircraft through this, so the two always agree.
 *
 * Decorative to a screen reader: everywhere it is used the type's name is set
 * in text right beside it, and an alt naming the aircraft again only made the
 * name read twice.
 */
export function AircraftPicture({
  aircraft,
  sizes,
  className,
}: {
  aircraft: Aircraft;
  /** The `sizes` hint for the image, as wide as the frame is drawn. */
  sizes: string;
  className?: string;
}) {
  if (!aircraft.image) {
    return (
      <AircraftSilhouette
        length={aircraft.length}
        height={aircraft.height}
        label=""
        className={className}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`tgva-aircraft-frame ${className ?? ""}`}
      style={{ aspectRatio: `${longest * 1.03} / ${tallest}` }}
    >
      <Image
        src={aircraft.image.src}
        alt=""
        width={aircraft.image.width}
        height={aircraft.image.height}
        sizes={sizes}
        style={{ "--tgva-scale": Math.max(aircraft.length, SMALLEST_DRAWN) / longest } as CSSProperties}
      />
    </span>
  );
}
