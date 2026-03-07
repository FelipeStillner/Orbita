import type { PlaceProperties } from "../types";
import { Button, Badge, Text } from "../../../components";

interface Props {
  data: PlaceProperties;
  onOpenMap: () => void;
  index?: number;
}

function MapIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

export default function PlaceReel({ data, onOpenMap, index = 0 }: Props) {
  const images =
    data.images && data.images.length > 0
      ? data.images
      : [
        {
          url: "https://placehold.co/600x800/1a1a1a/FFF?text=No+Image",
          description: "Placeholder",
          is_primary: true,
        },
      ];

  return (
    <div
      className="h-dvh w-screen relative bg-black overflow-hidden"
      style={{
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
      }}
    >
      {/* Horizontal Image Carousel */}
      <div className="no-scrollbar flex overflow-x-auto overflow-y-hidden h-full w-full snap-x snap-mandatory">
        {images.map((img, imgIndex) => (
          <div
            key={imgIndex}
            className="min-w-[100vw] h-full bg-cover bg-center snap-start relative transition-all duration-500"
            style={{ backgroundImage: `url(${img.url})` }}
          >
            {/* Simple gradient overlays - grayscale only */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

            {/* Image Counter with glass effect */}
            {images.length > 1 && (
              <div className="absolute top-8 right-8 animate-fade-slide-up" style={{ animationDelay: `${0.1 + imgIndex * 0.05}s` }}>
                <Badge>
                  {imgIndex + 1} / {images.length}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map Button */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 z-50 animate-fade-slide-up"
        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
      >
        <Button
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMap();
          }}
          className="shadow-2xl"
        >
          <MapIcon />
        </Button>
      </div>

      {/* Place Info with glass panel */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-8 pr-28 pb-12 animate-fade-slide-up"
        style={{ animationDelay: `${0.2 + index * 0.05}s` }}
      >
        <div
          className="absolute inset-0 rounded-t-[3rem]"
        />

        {/* Content */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <Text
              variant="h2"
              className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-2xl"
            >
              {data.name}
            </Text>

            <Badge>
              {data.category}
            </Badge>
          </div>

          <Text
            variant="body"
            className="leading-relaxed text-white/90 drop-shadow-lg max-w-2xl"
          >
            {data.description}
          </Text>
        </div>
      </div>

      {/* Top gradient for depth */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
    </div>
  );
}
