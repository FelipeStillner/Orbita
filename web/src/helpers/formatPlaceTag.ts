function capitalizeWords(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Turns OSM-style tags (e.g. `tourism:viewpoint`) into short labels. */
export function formatPlaceTagLabel(tag: string): string {
  const t = tag.trim();
  const i = t.indexOf(":");
  if (i <= 0) {
    return capitalizeWords(t.replace(/_/g, " "));
  }
  const key = t.slice(0, i).replace(/_/g, " ");
  const val = t.slice(i + 1).replace(/_/g, " ");
  return `${capitalizeWords(key)} · ${val}`;
}
