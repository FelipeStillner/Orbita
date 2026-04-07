import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  fetchGuide,
  type GuideDetail,
  type GuideStepPlace,
} from "@api";
import GuideEditDrawer from "./components/GuideEditDrawer";
import GuideStepPlaceCard from "./components/GuideStepPlaceCard";
import { Button, Text, LoadingPage, ErrorPage } from "@components";
import { BackIcon, EditIcon } from "@assets/icons";
import { useGeolocation } from "@hooks/useGeolocation";
import { haversineDistanceMeters } from "@helpers/formatDistance";
import { getHomeCardImageUrl } from "@helpers/imageUrls";
import { placeMapLabel } from "./guideOrderLabels";

const STADIA_API_KEY = import.meta.env.VITE_STADIA_API_KEY;

/** Ordered gallery: guide cover first, then place images in step/place order (deduped). */
function coverGalleryUrls(detail: GuideDetail): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (url: string | undefined) => {
    const t = url?.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };
  push(detail.cover_url);
  for (const s of detail.steps ?? []) {
    for (const p of s.places ?? []) {
      const urls =
        (p.image_urls?.length ?? 0) > 0
          ? p.image_urls!
          : p.primary_image_url?.trim()
            ? [p.primary_image_url]
            : [];
      for (const u of urls) {
        push(u);
      }
    }
  }
  return out;
}

function stepCentroid(places: GuideStepPlace[]): [number, number] | null {
  if (!places.length) return null;
  let lat = 0;
  let lon = 0;
  for (const p of places) {
    lat += p.lat;
    lon += p.lon;
  }
  const n = places.length;
  return [lat / n, lon / n];
}

function StadiaTiles() {
  const map = useMap();

  useEffect(() => {
    const layer = L.tileLayer(
      `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`,
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noreferrer">Stadia Maps</a> ' +
          '&copy; <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> ' +
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }
    );
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

function MapFitGuide({
  detail,
  userLat,
  userLng,
}: {
  detail: GuideDetail;
  userLat?: number | null;
  userLng?: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];
    for (const s of detail.steps ?? []) {
      for (const p of s.places ?? []) {
        points.push([p.lat, p.lon]);
      }
    }
    if (
      userLat != null &&
      userLng != null &&
      Number.isFinite(userLat) &&
      Number.isFinite(userLng)
    ) {
      points.push([userLat, userLng]);
    }
    if (points.length === 0) {
      map.setView([0, 0], 2);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
  }, [map, detail, userLat, userLng]);

  return null;
}

const userLocationIconLeaflet = L.divIcon({
  className: "orbita-user-marker",
  html: `<div class="orbita-user-marker-inner"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function guidePlaceMarkerIcon(label: string): L.DivIcon {
  const safe = label.replace(/[^0-9a-z]/gi, "");
  const w = Math.max(32, 8 + safe.length * 9);
  return L.divIcon({
    className: "orbita-guide-step-marker",
    html: `<div class="orbita-guide-place-label-inner">${safe}</div>`,
    iconSize: [w, 28],
    iconAnchor: [w / 2, 14],
    popupAnchor: [0, -12],
  });
}

function GuidePlaceMarkers({
  guideId,
  places,
}: {
  guideId: string;
  places: { place_id: string; lat: number; lon: number; label: string }[];
}) {
  const navigate = useNavigate();
  return (
    <>
      {places.map((p) => (
        <Marker
          key={p.place_id}
          position={[p.lat, p.lon]}
          icon={guidePlaceMarkerIcon(p.label)}
          zIndexOffset={600}
          eventHandlers={{
            click: () => {
              navigate(`/guides/${guideId}?place=${p.place_id}`);
            },
          }}
        />
      ))}
    </>
  );
}

export default function GuideDetailPage() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const [mapReady, setMapReady] = useState(false);
  const [editGuideOpen, setEditGuideOpen] = useState(false);
  const { location: userLocation } = useGeolocation({ watch: true });

  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["guide", guideId],
    queryFn: () => fetchGuide(guideId!),
    enabled: !!guideId,
  });

  const centroids = useMemo(() => {
    if (!detail) {
      return [] as [number, number][];
    }
    const stepList = detail.steps ?? [];
    return stepList
      .map((s) => stepCentroid(s.places ?? []))
      .filter((x): x is [number, number] => x !== null);
  }, [detail]);

  const mapPlaces = useMemo(() => {
    const out: { place_id: string; lat: number; lon: number; label: string }[] = [];
    if (!detail?.steps) return out;
    detail.steps.forEach((s, stepIndex) => {
      (s.places ?? []).forEach((p, placeIndex) => {
        out.push({
          place_id: p.place_id,
          lat: p.lat,
          lon: p.lon,
          label: placeMapLabel(stepIndex, placeIndex),
        });
      });
    });
    return out;
  }, [detail]);

  const coverImages = useMemo(
    () => (detail ? coverGalleryUrls(detail) : []),
    [detail]
  );

  if (!guideId) {
    return (
      <ErrorPage
        title="Missing guide"
        description="No guide was specified."
        action={
          <Button size="md" className="w-full" onClick={() => navigate("/guides")}>
            Back to guides
          </Button>
        }
      />
    );
  }

  if (isLoading) {
    return <LoadingPage message="Loading guide…" />;
  }

  if (isError || !detail) {
    return (
      <ErrorPage
        title="Could not load guide"
        description="This guide may have been deleted or you may not have access."
        action={
          <Button size="md" className="w-full" onClick={() => navigate("/guides")}>
            Back to guides
          </Button>
        }
      />
    );
  }

  const defaultCenter: [number, number] =
    centroids[0] ?? [20, 0];

  const steps = detail.steps ?? [];

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-black text-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-black px-4 pb-3 pt-6">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl shrink-0"
          onClick={() => navigate("/guides")}
          aria-label="Back to guides"
        >
          <BackIcon />
        </Button>
        <div className="flex-1 min-w-0">
          <Text variant="h2" className="truncate">
            {detail.title}
          </Text>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl shrink-0 text-white/90 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6"
          onClick={() => setEditGuideOpen(true)}
          aria-label="Edit guide"
        >
          <EditIcon />
        </Button>
      </header>

      <GuideEditDrawer
        open={editGuideOpen}
        onClose={() => setEditGuideOpen(false)}
        guideId={guideId}
        detail={detail}
      />

      {/* Mobile: map + cover both 16:9, gap-2 between; md+: map ⅓, cover ⅔. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] md:overflow-hidden">
        <div className="flex shrink-0 flex-col gap-2 bg-black px-2 md:grid md:h-[min(28vh,260px)] md:min-h-[180px] md:max-h-[min(32vh,280px)] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:grid-rows-1 md:gap-3 md:px-3">
          <div
            className={`relative z-0 min-h-0 overflow-hidden rounded-xl bg-black md:h-full ${
              mapReady ? "opacity-100" : "opacity-0"
            } transition-opacity duration-500`}
          >
            {/* Mobile: same 16:9 height as cover strip below; md: fill grid cell */}
            <div className="relative aspect-[16/9] w-full md:absolute md:inset-0 md:aspect-auto md:h-full md:min-h-0">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                className="h-full w-full !bg-black orbita-map outline-none [&_.leaflet-container]:z-0 [&_.leaflet-container]:rounded-xl"
                whenReady={() => setMapReady(true)}
              >
                <StadiaTiles />
                <MapFitGuide
                  detail={detail}
                  userLat={userLocation?.lat}
                  userLng={userLocation?.lng}
                />
                {userLocation ? (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userLocationIconLeaflet}
                  />
                ) : null}
                <GuidePlaceMarkers guideId={guideId} places={mapPlaces} />
              </MapContainer>
            </div>
          </div>
          <div className="relative min-h-0 overflow-hidden bg-black md:h-full md:min-w-0">
            <div className="aspect-[16/9] w-full md:absolute md:inset-0 md:aspect-auto md:h-full">
              {coverImages.length > 0 ? (
                <div
                  className="flex h-full w-full snap-x snap-mandatory items-stretch gap-x-1.5 overflow-x-auto overflow-y-hidden py-0 scroll-smooth no-scrollbar [-webkit-overflow-scrolling:touch] md:snap-none"
                  aria-label="Guide photos"
                >
                  {coverImages.map((url, i) => (
                    <div
                      key={`${i}-${url.slice(0, 80)}`}
                      className="flex h-full min-h-0 shrink-0 snap-start items-center bg-black md:min-h-0 md:snap-none"
                    >
                      <img
                        src={getHomeCardImageUrl(url)}
                        alt=""
                        className="h-full w-auto max-h-full max-w-[min(200vw,2400px)] rounded-xl object-contain"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-0 items-center justify-center px-6 text-center text-sm text-white/45 md:min-h-0">
                  No photo yet — add places with images to show a cover
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-b border-white/10 bg-zinc-950/90 px-4 pb-5 pt-0 md:pb-6">
          <div className="mx-auto max-w-2xl w-full">
            {detail.blurb ? (
              <Text variant="body" className="leading-relaxed text-white/90 text-[15px] sm:text-base">
                {detail.blurb}
              </Text>
            ) : (
              <Text variant="body-sm" muted>
                No description yet. Tap Edit to add one.
              </Text>
            )}
          </div>
        </div>

        <div
          className="shrink-0 space-y-6 overflow-x-hidden bg-zinc-950/90 px-4 pt-0 no-scrollbar pb-[calc(4.5rem+max(1rem,env(safe-area-inset-bottom,0px))+0.5rem)] md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto"
        >
        <section className="mx-auto w-full max-w-6xl">
          {steps.length === 0 ? (
            <Text variant="body" muted>
              No steps yet. Open <span className="text-white/80">Edit</span> to add a step, then add
              places from a place&apos;s detail screen.
            </Text>
          ) : (
            <div className="divide-y divide-white/10">
              {steps.map((step, i) => (
                <article
                  key={step.id}
                  className="py-6 first:pt-0 sm:py-7"
                >
                  <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
                    {/* Left: step title + description */}
                    <div className="shrink-0 lg:w-[min(100%,280px)] lg:max-w-[40%]">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-xs font-semibold tabular-nums text-white/45">
                          {i + 1}.
                        </span>
                        <Text
                          variant="h3"
                          className={`text-base font-semibold tracking-tight sm:text-[17px] ${
                            step.step_title?.trim() ? "text-white" : "text-white/50"
                          }`}
                        >
                          {step.step_title?.trim() || "Untitled step"}
                        </Text>
                      </div>
                      {step.step_note?.trim() ? (
                        <Text
                          variant="body-sm"
                          className="mt-2 leading-relaxed text-white/75"
                        >
                          {step.step_note}
                        </Text>
                      ) : (
                        <Text variant="body-sm" muted className="mt-2">
                          No description yet.
                        </Text>
                      )}
                    </div>

                    {/* Right: horizontal scroll of place cards; option note under each card */}
                    <div className="min-w-0 flex-1">
                      {(step.places ?? []).length === 0 ? (
                        <Text variant="body-sm" muted>
                          No places in this step.
                        </Text>
                      ) : (
                        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto scroll-smooth px-1 pb-1 sm:gap-4">
                          {(step.places ?? []).map((p, pi) => {
                            const distanceMeters =
                              userLocation &&
                              Number.isFinite(userLocation.lat) &&
                              Number.isFinite(userLocation.lng)
                                ? haversineDistanceMeters(
                                    userLocation.lat,
                                    userLocation.lng,
                                    p.lat,
                                    p.lon
                                  )
                                : undefined;
                            return (
                            <div
                              key={p.place_id}
                              className="flex w-[160px] shrink-0 flex-col gap-2 sm:w-[200px]"
                            >
                              <GuideStepPlaceCard
                                guideId={guideId}
                                place={p}
                                mapLabel={placeMapLabel(i, pi)}
                                distanceMeters={distanceMeters}
                              />
                              {p.option_note?.trim() ? (
                                <Text
                                  variant="body-sm"
                                  muted
                                  className="leading-relaxed line-clamp-4 px-0.5"
                                >
                                  {p.option_note}
                                </Text>
                              ) : null}
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}
