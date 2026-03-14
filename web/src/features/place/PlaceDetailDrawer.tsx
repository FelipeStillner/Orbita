import { Button } from "@components";
import { CloseIcon } from "@assets/icons";
import { usePlaceDetailViewModel } from "./usePlaceDetailViewModel";
import PlaceDetailPanelContent from "./components/PlaceDetailPanelContent";
import SaveToCollectionDrawer from "./components/SaveToCollectionDrawer";

const BOTTOM_BAR_OFFSET = "calc(72px + max(1rem, env(safe-area-inset-bottom)))";

interface PlaceDetailDrawerProps {
  open: boolean;
  placeId: string | null;
  onClose: () => void;
}

export default function PlaceDetailDrawer({
  open,
  placeId,
  onClose,
}: PlaceDetailDrawerProps) {
  const {
    place,
    isLoading,
    isError,
    isExiting,
    requestClose,
    saveDrawerOpen,
    setSaveDrawerOpen,
    handleBack,
    handleOpenMap,
    handleLike,
    handleSaveClick,
    handleSaved,
  } = usePlaceDetailViewModel(open ? placeId : null, onClose);

  if (!open && !isExiting) return null;

  return (
    <>
      {/* Backdrop - above content only on mobile/tablet; hidden on desktop so underlying page stays interactive */}
      <button
        type="button"
        aria-label="Close"
        className="fixed left-0 right-0 z-[90] bg-black/50 transition-opacity duration-300 md:hidden"
        style={{
          top: 0,
          bottom: BOTTOM_BAR_OFFSET,
        }}
        onClick={requestClose}
      />

      {/* Floating panel: same horizontal inset as BottomBar on mobile; fixed width (360px) on desktop */}
      <div
        className={`fixed my-4 left-4 right-4 md:left-auto md:right-4 z-[95] md:w-[400px] flex flex-col overflow-hidden glass-dark border border-white/10 shadow-2xl ${isExiting ? "animate-slide-out-right" : "animate-slide-in-right"}`}
        style={{
          top: 0,
          bottom: BOTTOM_BAR_OFFSET,
          borderRadius: "1.5rem",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Place details"
      >
        {/* Close button - top left */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            size="md"
            className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            onClick={handleBack}
            aria-label="Close"
          >
            <CloseIcon />
          </Button>
        </div>

        {/* Content - same radius so inner content doesn't cover panel corners */}
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{ borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}
        >
          {isLoading && !place ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : isError || !place ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-4">
              <p className="text-white/70 text-sm text-center">
                Could not load this place.
              </p>
              <Button size="sm" variant="default" onClick={requestClose}>
                Close
              </Button>
            </div>
          ) : (
            <PlaceDetailPanelContent
              place={place}
              onLike={handleLike}
              onSaveClick={handleSaveClick}
              onOpenMap={handleOpenMap}
            />
          )}
        </div>
      </div>

      <SaveToCollectionDrawer
        key={place?.id}
        place={saveDrawerOpen && place ? place : null}
        onClose={() => setSaveDrawerOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
