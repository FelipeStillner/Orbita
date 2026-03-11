import { Link } from "react-router-dom";
import { useHomeViewModel } from "./useHomeViewModel";
import CategorySection from "./components/CategorySection";
import { Text, LoadingPage, ErrorPage, Button } from "@components";

export default function HomePage() {
  const { viewState, categories, loadMoreRef, isFetchingNextPage, scrollRef, isReady } =
    useHomeViewModel();

  if (viewState === "ERROR")
    return (
      <ErrorPage
        title="Location Required"
        description="We need your location to show you the best places nearby. Please enable location access in your browser settings."
        action={
          <Link to="/">
            <Button size="md" className="w-full">
              Go Back Home
            </Button>
          </Link>
        }
      />
    );
  if (viewState === "LOADING")
    return <LoadingPage message="Finding the best spots..." />;

  return (
    <div
      ref={scrollRef}
      className={`
        no-scrollbar h-dvh w-screen bg-black overflow-y-auto overflow-x-hidden
        transition-opacity duration-500
        ${isReady ? "opacity-100" : "opacity-0"}
      `}
    >
      <Text variant="h1" className="text-white p-6">
        Orbita
      </Text>

      <div className="space-y-2">
        {categories.length === 0 && !isFetchingNextPage ? (
          <div className="px-6 py-12">
            <Text variant="body" muted>
              No places nearby yet. Check back later.
            </Text>
          </div>
        ) : (
          categories.map(({ category, places }) => (
            <CategorySection
              key={category}
              category={category}
              places={places}
            />
          ))
        )}
      </div>

      <div
        ref={loadMoreRef}
        className="h-20 w-full flex items-center justify-center"
      >
        {isFetchingNextPage && (
          <div className="glass-dark rounded-full px-6 py-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <Text variant="body-sm">Loading more...</Text>
          </div>
        )}
      </div>
    </div>
  );
}
