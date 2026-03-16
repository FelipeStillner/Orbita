import { Link } from "react-router-dom";
import { useHomeViewModel } from "./useHomeViewModel";
import CategorySection from "./components/CategorySection";
import { Text, LoadingPage, ErrorPage, Button } from "@components";

export default function HomePage() {
  const { viewState, categories, scrollRef, isReady, searchNearby, searchLoading } =
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
      <div className="flex items-center justify-between p-6">
        <Text variant="h1" className="text-white">
          Orbita
        </Text>
        <Button
          size="md"
          onClick={searchNearby}
          disabled={searchLoading}
          rounded={false}
        >
          Search nearby
        </Button>
      </div>

      <div className="space-y-2">
        {categories.length === 0 ? (
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
    </div>
  );
}
