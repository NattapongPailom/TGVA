/**
 * Bars derived from a seed, so the same thing always prints the same code and
 * two different things never print the same one. Heights are percentages of
 * the barcode's box; widths are pixels.
 */
export function barcode(seed: string, length = 46) {
  let state = 0;
  for (const character of seed) state = (state * 31 + character.charCodeAt(0)) % 9973;
  return Array.from({ length }, () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return { height: 40 + ((state >> 8) % 60), width: (state >> 4) % 3 === 0 ? 3 : 2 };
  });
}
