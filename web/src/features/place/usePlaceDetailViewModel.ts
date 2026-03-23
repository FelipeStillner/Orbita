import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Place } from "@types";
import { fetchPlace } from "@api";
import { sendInteraction } from "./api";
import { useAuth } from "@context/AuthContext";

const CLOSE_ANIMATION_MS = 300;

export function usePlaceDetailViewModel(
  placeId: string | null,
  onClose: () => void
) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isExiting, setIsExiting] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const requestClose = useCallback(() => setIsExiting(true), []);

  const doClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(doClose, CLOSE_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [isExiting, doClose]);

  useEffect(() => {
    if (!placeId) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExiting(true);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [placeId]);

  const {
    data: place,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlace(placeId!),
    enabled: !!placeId,
  });

  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);
  const handleBack = requestClose;

  const handleOpenMap = () => {
    if (!place) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    if (!place || !placeId) return;
    const nextLiked = !place.liked;
    queryClient.setQueryData<Place>(["place", placeId], (old) =>
      old ? { ...old, liked: nextLiked } : old
    );
    await sendInteraction(place.id, { liked: nextLiked, hidden: false });
    queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) return;
    setSaveDrawerOpen(true);
  };

  const handleSaved = (collections: { id: string; name: string }[]) => {
    if (!placeId) return;
    queryClient.setQueryData<Place>(["place", placeId], (old) =>
      old ? { ...old, collections } : old
    );
    queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  return {
    place: place ?? null,
    isLoading,
    isError: !!placeId && isError,
    isExiting,
    requestClose,
    saveDrawerOpen,
    setSaveDrawerOpen,
    handleBack,
    handleOpenMap,
    handleLike,
    handleSaveClick,
    handleSaved,
  };
}
