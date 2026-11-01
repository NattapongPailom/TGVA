import { longest, tallest } from "@/content/fleet";

/**
 * A side profile drawn from a type's own length and overall height.
 *
 * Every silhouette shares one viewBox, sized to the largest of each, so two
 * drawn anywhere on the page are genuinely to scale against one another and
 * line up at the nose. A short type simply leaves space to its right, which is
 * the comparison working rather than a gap to be closed.
 */
export function AircraftSilhouette({
  length,
  height,
  label,
  fit = false,
  className,
}: {
  length: number;
  height: number;
  label: string;
  /** Crop the box to this airframe alone. Right for a glyph, wrong wherever
   *  the silhouettes are meant to be compared. */
  fit?: boolean;
  className?: string;
}) {
  const L = length;
  const H = height;
  const belly = H * 0.86;
  const depth = H * 0.32;
  const crown = belly - depth;
  const mid = (belly + crown) / 2;

  const fuselage =
    `M${0.08 * L} ${crown}` +
    `C${0.028 * L} ${crown} ${0} ${mid - depth * 0.22} ${0} ${mid}` +
    `C${0} ${mid + depth * 0.24} ${0.028 * L} ${belly} ${0.08 * L} ${belly}` +
    `L${0.735 * L} ${belly}` +
    `C${0.88 * L} ${belly} ${0.968 * L} ${crown + depth * 0.7} ${L} ${crown + depth * 0.4}` +
    `L${0.98 * L} ${crown + depth * 0.22}` +
    `L${0.775 * L} ${crown}Z`;

  const fin =
    `M${0.762 * L} ${crown + depth * 0.1}` +
    `L${0.918 * L} 0L${0.988 * L} 0` +
    `L${0.996 * L} ${crown + depth * 0.24}` +
    `L${0.868 * L} ${crown + depth * 0.1}Z`;

  const stabiliser =
    `M${0.845 * L} ${crown + depth * 0.3}` +
    `L${1.03 * L} ${crown - depth * 0.04}` +
    `L${1.03 * L} ${crown + depth * 0.14}` +
    `L${0.895 * L} ${crown + depth * 0.5}Z`;

  const wing =
    `M${0.4 * L} ${belly - depth * 0.3}` +
    `L${0.672 * L} ${belly + H * 0.082}` +
    `L${0.79 * L} ${belly + H * 0.082}` +
    `L${0.6 * L} ${belly - depth * 0.3}Z`;

  const nx = 0.33 * L;
  const nw = 0.14 * L;
  const ny = belly - H * 0.02;
  const nh = H * 0.115;
  const nr = nh * 0.5;
  const nacelle =
    `M${nx + nr} ${ny}L${nx + nw - nr} ${ny}A${nr} ${nr} 0 0 1 ${nx + nw - nr} ${ny + nh}` +
    `L${nx + nr} ${ny + nh}A${nr} ${nr} 0 0 1 ${nx + nr} ${ny}Z`;

  return (
    <svg
      viewBox={`0 0 ${(fit ? L : longest) * 1.03} ${fit ? H : tallest}`}
      /* An empty label means the shape is decoration beside text that already
         names it: hidden, rather than an image with no name. */
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={className}
    >
      <path d={[fuselage, fin, stabiliser, wing, nacelle].join(" ")} />
    </svg>
  );
}
