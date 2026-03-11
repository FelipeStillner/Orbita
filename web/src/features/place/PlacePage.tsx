import { usePlaceViewModel } from "./usePlaceViewModel";
import PlaceDetailView from "./components/PlaceDetailView";
import SaveToCollectionDrawer from "./components/SaveToCollectionDrawer";
import { LoadingPage } from "@components";

export default function PlacePage() {
  const {
    place,
    isInvalid,
    isLoading,
    saveDrawerOpen,
    setSaveDrawerOpen,
    handleBack,
    handleOpenMap,
    handleLike,
    handleSaveClick,
    handleSaved,
  } = usePlaceViewModel();

  if (isInvalid) return null;
  if (isLoading && !place) return <LoadingPage message="Loading place..." />;
  if (!place) return null;

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
