import { Button, Text } from "../../../components";
import { BackIcon } from "../../../assets/icons";
import PlaceItemRow from "./PlaceItemRow";
import type { Collection, CollectionPlace } from "../../../api";

interface CollectionPlacesPanelProps {
  isOpen: boolean;
  collection: Collection | undefined;
  places: CollectionPlace[];
  placesLoading: boolean;
  onClose: () => void;
  onRemovePlace: (placeId: string) => void;
  isRemovingPlace?: boolean;
}

export default function CollectionPlacesPanel({
  isOpen,
  collection,
  places,
  placesLoading,
  onClose,
  onRemovePlace,
  isRemovingPlace = false,
}: CollectionPlacesPanelProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close"
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 z-[100] h-dvh w-full max-w-md bg-gradient-to-br from-dark-50 to-dark border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={collection ? `Places in ${collection.name}` : "Collection places"}
      >
        <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            rounded={false}
            onClick={onClose}
            className="rounded-xl"
            aria-label="Back to collections"
          >
            <BackIcon />
          </Button>
          <Text variant="h3" className="flex-1 min-w-0 truncate">
            {collection?.name ?? ""}
          </Text>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          {placesLoading ? (
            <div className="flex items-center gap-2 py-8">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <Text variant="body-sm" muted>
                Loading…
              </Text>
            </div>
          ) : places.length === 0 ? (
            <Text variant="body" muted className="py-8">
              No places in this collection.
            </Text>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {places.map((place) => (
                <PlaceItemRow
                  key={place.id}
                  place={place}
                  onRemove={() => onRemovePlace(place.id)}
                  isRemoving={isRemovingPlace}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
