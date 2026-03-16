import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapViewModel, type MapPlace } from "./useMapViewModel";
import { LoadingPage, ErrorPage, Button } from "@components";
import { getCategoryLabel } from "@helpers/formatCategoryLabel";

// Place marker: minimal grayscale dot to match app design
const placeMarkerIcon = L.divIcon({
  className: "orbita-place-marker",
  html: `<div class="orbita-marker-inner"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
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

export default function MapPage() {
  const navigate = useNavigate();
  const { viewState, location, places } = useMapViewModel();
  const [mapReady, setMapReady] = useState(false);

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
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={userLocationIcon}>
            <Popup>
              <span className="text-sm font-medium text-white/90">You are here</span>
            </Popup>
          </Marker>
          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={placeMarkerIcon}
              eventHandlers={{
                click: () => handleMarkerClick(place.id),
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <Link
                    to={`/map?place=${place.id}`}
                    className="block rounded-lg transition-opacity hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-semibold text-white text-sm leading-tight">
                      {place.name}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">
                      {getCategoryLabel(place.category)}
                    </p>
                    <p className="text-white/80 text-xs mt-1.5">
                      Tap to view details →
                    </p>
                  </Link>
                </div>
              </Popup>
            </Marker>
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
