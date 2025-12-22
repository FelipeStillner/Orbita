import type { PlaceProperties } from "../types";

interface Props {
  data: PlaceProperties;
  onOpenMap: () => void;
}

export default function PlaceReel({ data, onOpenMap }: Props) {
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
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* --- IMAGE CAROUSEL --- */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          height: "100%",
          width: "100%",
        }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            style={{
              minWidth: "100vw",
              height: "100%",
              backgroundImage: `url(${img.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              scrollSnapAlign: "start",
              position: "relative",
            }}
          >
            {/* Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "60%",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
              }}
            />

            {/* Image Counter */}
            {images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  backdropFilter: "blur(4px)",
                }}
              >
                {index + 1} / {images.length}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MAP BUTTON (Floating Right Center) --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenMap();
        }}
        style={{
          position: "absolute",
          right: "16px", // Distance from right edge
          top: "50%", // Center vertically
          transform: "translateY(-50%)",
          zIndex: 50, // Ensure it is above images

          width: "60px", // Bigger size
          height: "60px",
          borderRadius: "50%", // Circular

          backgroundColor: "rgba(255, 255, 255, 0.15)", // Frosted glass look
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.4)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          cursor: "pointer",
          outline: "none",
        }}
        aria-label="Open in Maps"
      >
        {/* Map Icon (Bigger) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      </button>

      {/* --- INFO TEXT (Bottom Left) --- */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%", // Full width, but we pad the content so it doesn't overlap the button
          padding: "24px 80px 40px 20px", // Right padding 80px to avoid button overlap if button moves down
          zIndex: 10,
          color: "white",
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 700,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {data.name}
        </h2>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginTop: "10px",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          {data.category}
        </div>

        <p
          style={{
            margin: 0,
            opacity: 0.9,
            fontSize: "1rem",
            lineHeight: "1.4",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            maxWidth: "100%",
          }}
        >
          {data.description}
        </p>
      </div>
    </div>
  );
}
