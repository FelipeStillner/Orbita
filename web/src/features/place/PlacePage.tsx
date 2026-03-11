import { usePlaceViewModel } from "./usePlaceViewModel";
import PlaceDetailView from "./components/PlaceDetailView";
import SaveToCollectionDrawer from "./components/SaveToCollectionDrawer";

export default function PlacePage() {
  const {
    place,
    isInvalid,
    saveDrawerOpen,
    setSaveDrawerOpen,
    handleBack,
    handleOpenMap,
    handleLike,
    handleSaveClick,
    handleSaved,
  } = usePlaceViewModel();

  if (isInvalid || !place) return null;

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
