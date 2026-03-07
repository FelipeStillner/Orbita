import { useFeedViewModel } from "./hooks/useFeedViewModel";
import FeedLoading from "./components/FeedLoading";
import FeedError from "./components/FeedError";
import FeedList from "./components/FeedList";

export default function FeedPage() {
  const {
    viewState,
    places,
    loadMoreRef,
    isFetchingNextPage,
    handleOpenMap,
    handleInteraction,
  } =
    useFeedViewModel();

  switch (viewState) {
    case "ERROR":
      return <FeedError />;
    case "SUCCESS":
      return (
        <FeedList
          places={places}
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          onOpenMap={handleOpenMap}
          onInteraction={handleInteraction}
        />
      );
    case "LOADING":
    default:
      return <FeedLoading />;
  }
}
