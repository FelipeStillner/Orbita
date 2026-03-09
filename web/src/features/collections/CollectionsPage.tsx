import { useCollectionsViewModel } from "./hooks/useCollectionsViewModel";
import CollectionsListView from "./components/CollectionsListView";
import CollectionPlacesPanel from "./components/CollectionPlacesPanel";

export default function CollectionsPage() {
  const vm = useCollectionsViewModel();

  return (
    <>
      <CollectionsListView vm={vm} />
      <CollectionPlacesPanel
        isOpen={vm.isPanelOpen}
        collection={vm.selectedCollection}
        places={vm.places}
        placesLoading={vm.placesLoading}
        onClose={() => vm.setSelectedCollectionId(null)}
        onRemovePlace={(placeId) =>
          vm.selectedCollectionId &&
          vm.removePlaceMutation.mutate({
            collectionId: vm.selectedCollectionId,
            placeId,
          })
        }
        isRemovingPlace={vm.removePlaceMutation.isPending}
      />
    </>
  );
}
