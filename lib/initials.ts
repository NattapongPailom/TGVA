/**
 * Two letters for a photo frame that has no photo yet: the first letter of
 * each hyphenated part ("IFTH-Prichachan" → "IP"), or the first two letters of
 * a single word ("Tjb0709" → "TJ"). Digits are not initials.
 */
export function initials(name: string) {
  const parts = name.replace(/[^A-Za-z-]/g, "").split("-").filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}
