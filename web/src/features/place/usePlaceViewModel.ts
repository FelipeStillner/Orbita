import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { Place } from "@types";
import { sendInteraction } from "./api";

export function usePlaceViewModel() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const placeFromState = (location.state as { place?: Place } | null)?.place;

  const [place, setPlace] = useState<Place | null>(placeFromState ?? null);
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);

  const isInvalid = !id || !place || place.id !== id;

  useEffect(() => {
    if (isInvalid) navigate("/", { replace: true });
  }, [isInvalid, navigate]);

  const handleBack = () => navigate("/");

  const handleOpenMap = () => {
    if (!place) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  const handleLike = async () => {
    if (!place) return;
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

  return {
    place,
    isInvalid,
    saveDrawerOpen,
    setSaveDrawerOpen,
    handleBack,
    handleOpenMap,
    handleLike,
    handleSaveClick,
    handleSaved,
  };
}
