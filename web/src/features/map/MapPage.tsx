import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapViewModel, type MapPlace } from "./useMapViewModel";
import { LoadingPage, ErrorPage, Button } from "@components";

const STADIA_API_KEY = import.meta.env.VITE_STADIA_API_KEY;

// Place marker: minimal grayscale dot to match app design
const placeMarkerIcon = L.divIcon({
  className: "orbita-place-marker",
  html: `<div class="orbita-marker-inner"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const selectedPlaceMarkerIcon = L.divIcon({
  className: "",
  html: `
    <svg
      class="orbita-selected-pin-svg"
      xmlns="http://www.w3.org/2000/svg"
      width="38"
      height="44"
      viewBox="0 0 38 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 1.75C10.5097 1.75 3.75 8.5097 3.75 17C3.75 28.85 19 42.25 19 42.25C19 42.25 34.25 28.85 34.25 17C34.25 8.5097 27.4903 1.75 19 1.75Z"
        fill="#EF4444"
        stroke="rgba(185, 28, 28, 0.95)"
        stroke-width="1.25"
      />
      <circle cx="19" cy="18" r="6.2" fill="#7F1D1D" />
      <circle cx="19" cy="18" r="3.2" fill="#2A0A0A" opacity="0.5" />
    </svg>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

// User location: white/gray pulse to match grayscale theme
const userLocationIcon = L.divIcon({
  className: "orbita-user-marker",
  html: `<div class="orbita-user-marker-inner"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function MapFitBounds({
  places,
  userLat,
  userLng,
}: {
  places: MapPlace[];
  userLat: number;
  userLng: number;
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [[userLat, userLng]];
    places.forEach((p) => points.push([p.latitude, p.longitude]));
    if (points.length === 1) {
      map.setView([userLat, userLng], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, places, userLat, userLng]);

  return null;
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

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { viewState, location, places } = useMapViewModel();
  const [mapReady, setMapReady] = useState(false);
  const selectedPlaceId = searchParams.get("place");
  const selectedPlace = selectedPlaceId ? places.find((p) => p.id === selectedPlaceId) ?? null : null;

  const handleMarkerClick = useCallback(
    (id: string) => {
      navigate(`/map?place=${id}`);
    },
    [navigate]
  );

  if (viewState === "ERROR")
    return (
      <ErrorPage
        title="Location Required"
        description="We need your location to show places on the map. Please enable location access in your browser settings."
        action={
          <Button size="md" className="w-full" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        }
      />
    );

  if (viewState === "LOADING")
    return <LoadingPage message="Loading map..." />;

  if (!location)
    return <LoadingPage message="Getting your location..." />;

  const center: [number, number] = [location.lat, location.lng];

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-black">
      <div
        className={`flex-1 w-full transition-opacity duration-500 ${mapReady ? "opacity-100" : "opacity-0"}`}
        style={{ minHeight: "calc(100dvh - 4.5rem)" }}
      >
        <MapContainer
          center={center}
          zoom={14}
          className="h-full w-full rounded-b-2xl orbita-map"
          style={{ minHeight: "calc(100dvh - 4.5rem)" }}
          whenReady={() => setMapReady(true)}
        >
          <StadiaTiles />
          <Marker position={center} icon={userLocationIcon}>
            <Popup>
              <span className="text-sm font-medium text-white/90">You are here</span>
            </Popup>
          </Marker>
          {selectedPlace && (
            <Marker
              position={[selectedPlace.latitude, selectedPlace.longitude]}
              icon={selectedPlaceMarkerIcon}
              zIndexOffset={1000}
              eventHandlers={{
                click: () => handleMarkerClick(selectedPlace.id),
              }}
            />
          )}
          {places
            .filter((place) => !selectedPlaceId || place.id !== selectedPlaceId)
            .map((place) => (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                icon={placeMarkerIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(place.id),
                }}
              />
            ))}
          <MapFitBounds
            places={places}
            userLat={location.lat}
            userLng={location.lng}
          />
        </MapContainer>
      </div>
    </div>
  );
}
