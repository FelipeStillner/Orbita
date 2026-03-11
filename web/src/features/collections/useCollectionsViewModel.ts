import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCollections,
  createCollection,
  deleteCollection,
  fetchCollectionPlaces,
  removePlaceFromCollection,
} from "@api";

export function useCollectionsViewModel() {
  const queryClient = useQueryClient();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const { data: places = [], isLoading: placesLoading } = useQuery({
    queryKey: ["collection-places", selectedCollectionId],
    queryFn: () => fetchCollectionPlaces(selectedCollectionId!),
    enabled: !!selectedCollectionId,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCollection(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setNewCollectionName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      if (selectedCollectionId === deletedId) setSelectedCollectionId(null);
    },
  });

  const removePlaceMutation = useMutation({
    mutationFn: ({ collectionId, placeId }: { collectionId: string; placeId: string }) =>
      removePlaceFromCollection(collectionId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-places"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
  const isPanelOpen = !!selectedCollectionId;

  const handleCreateCollection = () => {
    const name = newCollectionName.trim();
    if (!name) return;
    createMutation.mutate(name);
  };

  return {
    // state
    newCollectionName,
    setNewCollectionName,
    selectedCollectionId,
    setSelectedCollectionId,
    collections,
    places,
    selectedCollection,
    isPanelOpen,
    // loading
    collectionsLoading,
    placesLoading,
    // mutations
    createMutation,
    deleteMutation,
    removePlaceMutation,
    // actions
    handleCreateCollection,
  };
}

export type CollectionsViewModel = ReturnType<typeof useCollectionsViewModel>;
