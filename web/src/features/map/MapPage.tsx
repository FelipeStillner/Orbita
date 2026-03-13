import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapViewModel, type MapPlace } from "./useMapViewModel";
import { Text, LoadingPage, ErrorPage, Button } from "@components";
import { getCategoryLabel } from "@helpers/formatCategoryLabel";

// Fix default marker icon with Vite/bundlers (broken paths otherwise)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const userLocationIcon = L.divIcon({
  className: "user-location-pulse",
  html: `<div style="
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    border: 3px solid white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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
      navigate(`/place/${id}`);
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
    <div className="fixed inset-0 z-0 flex flex-col bg-dark">
      <header className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 safe-area-top glass-medium rounded-b-2xl border-b border-white/10">
        <Text variant="h2" className="text-white font-semibold">
          Map
        </Text>
        <Text variant="body-sm" muted>
          {places.length} place{places.length !== 1 ? "s" : ""} nearby
        </Text>
      </header>

      <div
        className={`flex-1 w-full mt-14 transition-opacity duration-300 ${mapReady ? "opacity-100" : "opacity-0"}`}
        style={{ minHeight: "calc(100dvh - 3.5rem)" }}
      >
        <MapContainer
          center={center}
          zoom={14}
          className="h-full w-full rounded-b-2xl"
          style={{ minHeight: "calc(100dvh - 3.5rem)" }}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={userLocationIcon}>
            <Popup>
              <Text variant="body-sm" className="font-medium">
                You are here
              </Text>
            </Popup>
          </Marker>
          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(place.id),
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <Link
                    to={`/place/${place.id}`}
                    className="block hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text variant="body" className="font-semibold text-white">
                      {place.name}
                    </Text>
                    <Text variant="body-sm" muted>
                      {getCategoryLabel(place.category)}
                    </Text>
                    <Text variant="body-sm" className="text-white/80 mt-1">
                      Tap to view details →
                    </Text>
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
