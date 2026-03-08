import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCollections,
  createCollection,
  addPlaceToCollection,
  removePlaceFromCollection,
} from "../api";
import type { PlaceFeature } from "../types";
import { Button, Text, Drawer, Input } from "../../../components";
import { PlusIcon, CheckIcon } from "../../../assets/icons";

interface SaveToCollectionDrawerProps {
  place: PlaceFeature | null;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SaveToCollectionDrawer({
  place,
  onClose,
  onSaved,
}: SaveToCollectionDrawerProps) {
  const queryClient = useQueryClient();
  const open = !!place;
  const placeId = place?.properties.id ?? "";

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set((place?.properties.collections ?? []).map((c) =>
      String(c.id)
    ))
  );
  const [newCollectionName, setNewCollectionName] = useState("");

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCollection(name),
    onSuccess: (newCol) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setSelectedIds((prev) => new Set(prev).add(newCol.id));
      setNewCollectionName("");
    },
  });

  const handleToggle = async (collectionId: string) => {
    const isChecked = selectedIds.has(collectionId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isChecked) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
    if (!placeId) return;
    try {
      if (isChecked) {
        await removePlaceFromCollection(collectionId, placeId);
      } else {
        await addPlaceToCollection(collectionId, placeId);
      }
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onSaved?.();
    } catch {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (isChecked) next.add(collectionId);
        else next.delete(collectionId);
        return next;
      });
    }
  };

  const handleCreateCollection = () => {
    const name = newCollectionName.trim();
    if (!name) return;
    createMutation.mutate(name);
  };

  return (
    <Drawer open={open} onClose={onClose} title="Save to collection">
      <div className="px-6 pt-2 pb-4 space-y-3">
        {/* List of collections */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <Text variant="body-sm" muted>
                Loading…
              </Text>
            </div>
          ) : collections.length === 0 && !newCollectionName ? (
            <Text variant="body" muted>
              No collections yet. Create one below.
            </Text>
          ) : (
            <ul className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
              {collections.map((col) => {
                const isInPlaceCollections = (
                  place?.properties.collections ?? []
                ).some((c) => String(c.id) === String(col.id));
                const isChecked =
                  selectedIds.has(col.id) || isInPlaceCollections;
                return (
                  <li key={col.id}>
                    <label className="group flex items-center gap-3 py-2 rounded-2xl cursor-pointer transition-colors min-h-[3rem]">
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white glass-medium group-hover:glass-strong">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(col.id)}
                          className="sr-only focus:outline-none"
                        />
                        {isChecked ? <CheckIcon /> : null}
                      </span>
                      <span className="text-base text-white flex-1 min-w-0">
                        {col.name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* New collection */}
        <div className="flex items-center gap-3 min-h-[3rem]">
          <Button
            size="md"
            className="flex items-center justify-center"
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim() || createMutation.isPending}
          >
            <PlusIcon />
          </Button>
          <Input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
            placeholder="New collection name"
            className="flex-1 min-w-0"
          />
        </div>
      </div>
    </Drawer>
  );
}
