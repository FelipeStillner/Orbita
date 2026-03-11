import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Place } from "@types";
import { fetchPlace } from "@api";
import { sendInteraction } from "./api";

export function usePlaceViewModel() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const placeFromState = (location.state as { place?: Place } | null)?.place;

  const {
    data: place,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["place", id],
    queryFn: () => fetchPlace(id!),
    enabled: !!id,
    initialData: placeFromState && placeFromState.id === id ? placeFromState : undefined,
  });

  const isInvalid = !id || isError;

  useEffect(() => {
    if (isInvalid) navigate("/", { replace: true });
  }, [isInvalid, navigate]);

  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);
  const handleBack = () => navigate("/");

  const handleOpenMap = () => {
    if (!place) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  const handleLike = async () => {
    if (!place) return;
    const nextLiked = !place.liked;
    queryClient.setQueryData<Place>(["place", id], (old) =>
      old ? { ...old, liked: nextLiked } : old
    );
    await sendInteraction(place.id, { liked: nextLiked, hidden: false });
    queryClient.invalidateQueries({ queryKey: ["place", id] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };

  const handleSaveClick = () => setSaveDrawerOpen(true);

  const handleSaved = (collections: { id: string; name: string }[]) => {
    queryClient.setQueryData<Place>(["place", id], (old) =>
      old ? { ...old, collections } : old
    );
    queryClient.invalidateQueries({ queryKey: ["place", id] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  return {
    place: place ?? null,
    isInvalid,
    isLoading,
    saveDrawerOpen,
    setSaveDrawerOpen,
    handleBack,
    handleOpenMap,
    handleLike,
    handleSaveClick,
    handleSaved,
  };
}
