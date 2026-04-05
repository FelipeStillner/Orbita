/** Rounds straight-line distance for display (meters from the API). */
export function formatDistanceMeters(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return "";
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  const rounded = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
  return `${rounded} km`;
}
