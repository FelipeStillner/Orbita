import { useNavigate } from "react-router-dom";
import { Button, Page, Text, Input } from "@components";
import { BackIcon, PlusIcon } from "@assets/icons";
import CollectionCard from "./CollectionCard";
import type { Collection } from "@api";
import type { CollectionsViewModel } from "../hooks/useCollectionsViewModel";

interface CollectionsListViewProps {
  vm: CollectionsViewModel;
}

export default function CollectionsListView({ vm }: CollectionsListViewProps) {
  const navigate = useNavigate();
  const {
    newCollectionName,
    setNewCollectionName,
    setSelectedCollectionId,
    collections,
    collectionsLoading,
    createMutation,
    deleteMutation,
    handleCreateCollection,
  } = vm;

  return (
    <Page className="min-h-dvh w-full justify-start pt-6 pb-6">
      <div className="w-full max-w-lg mx-auto px-4 py-6 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            rounded={false}
            onClick={() => navigate("/")}
            className="rounded-xl"
            aria-label="Back to home"
          >
            <BackIcon />
          </Button>
          <Text variant="h2">Collections</Text>
          <div className="w-10" aria-hidden />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Button
            size="md"
            className="flex-shrink-0"
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim() || createMutation.isPending}
            aria-label="Create collection"
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

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {collectionsLoading ? (
            <div className="flex items-center gap-2 py-8">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <Text variant="body-sm" muted>
                Loading…
              </Text>
            </div>
          ) : collections.length === 0 ? (
            <Text variant="body" muted className="py-8">
              No collections yet. Create one above.
            </Text>
          ) : (
            <div className="grid grid-cols-1 gap-3 pb-4">
              {collections.map((col: Collection) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  onSelect={() => setSelectedCollectionId(col.id)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(col.id);
                  }}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
