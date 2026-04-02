/** Scaled width for home cards (~200px CSS × ~2 DPR). */
const HOME_CARD_WIDTH = 480;

/**
 * Smaller image URL for home cards when possible.
 * Uses Wikimedia Commons `Special:FilePath` (redirects to a scaled file) — more reliable than hand-built /thumb/ URLs.
 */
export function getHomeCardImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  const viaCommons = tryCommonsSpecialFilePath(originalUrl, HOME_CARD_WIDTH);
  if (viaCommons) return viaCommons;

  if (originalUrl.includes("placehold.co")) {
    return originalUrl.replace(
      /placehold\.co\/\d+x\d+/i,
      "placehold.co/320x427"
    );
  }

  return originalUrl;
}

/**
 * https://commons.wikimedia.org/wiki/Commons:FAQ#What_are_the_different_forms_of_URLs?
 * Special:FilePath redirects to an appropriately scaled image on upload.wikimedia.org.
 */
function tryCommonsSpecialFilePath(url: string, widthPx: number): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "upload.wikimedia.org") return null;

    const pathname = u.pathname;
    if (!pathname.includes("/wikipedia/commons/")) return null;

    const fileName = extractCommonsFileName(pathname);
    if (!fileName) return null;

    const title = fileName.replace(/ /g, "_");
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=${widthPx}`;
  } catch {
    return null;
  }
}

function extractCommonsFileName(pathname: string): string | null {
  const lastSlash = pathname.lastIndexOf("/");
  if (lastSlash === -1) return null;
  const lastSeg = pathname.slice(lastSlash + 1);
  if (!lastSeg) return null;

  const thumbPx = /^(\d+)px-(.+)$/.exec(lastSeg);
  if (thumbPx) {
    try {
      return decodeURIComponent(thumbPx[2]);
    } catch {
      return thumbPx[2];
    }
  }

  try {
    return decodeURIComponent(lastSeg);
  } catch {
    return lastSeg;
  }
}
