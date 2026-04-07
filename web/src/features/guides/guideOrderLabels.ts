/** a, b, … z, aa, ab, … (Excel-style) for the n-th place within a step (0-based index). */
export function letterForPlaceIndexInStep(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    n -= 1;
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

/** Map/list key like `1a`, `2b`, `11aa` — step order + place letter within that step. */
export function placeMapLabel(stepIndex: number, placeIndexInStep: number): string {
  return `${stepIndex + 1}${letterForPlaceIndexInStep(placeIndexInStep)}`;
}
