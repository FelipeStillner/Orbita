import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Place } from "@types";
import PlaceDetailView from "./components/PlaceDetailView";
import SaveToCollectionDrawer from "./components/SaveToCollectionDrawer";
import { sendInteraction } from "./api";

export default function PlacePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const placeFromState = (location.state as { place?: Place } | null)?.place;

  const [place, setPlace] = useState<Place | null>(placeFromState ?? null);
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);

  if (!id) {
    navigate("/", { replace: true });
    return null;
  }

  if (!place || place.id !== id) {
    navigate("/", { replace: true });
    return null;
  }

  const handleBack = () => navigate("/");
  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };
  const handleLike = async () => {
    const nextLiked = !place.liked;
    setPlace((p) => (p ? { ...p, liked: nextLiked } : p));
    await sendInteraction(place.id, { liked: nextLiked, hidden: false });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };
  const handleSaveClick = () => setSaveDrawerOpen(true);
  const handleSaved = (collections: { id: string; name: string }[]) => {
    setPlace((p) => (p ? { ...p, collections } : p));
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  return (
    <>
      <PlaceDetailView
        place={place}
        onBack={handleBack}
        onLike={handleLike}
        onSaveClick={handleSaveClick}
        onOpenMap={handleOpenMap}
      />
      <SaveToCollectionDrawer
        key={place.id}
        place={saveDrawerOpen ? place : null}
        onClose={() => setSaveDrawerOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
