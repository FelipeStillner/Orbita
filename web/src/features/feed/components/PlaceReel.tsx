import type { PlaceProperties } from "../types";

interface Props {
  data: PlaceProperties;
}

export default function PlaceReel({ data }: Props) {
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
        width: "100vw", // Force full viewport width
        position: "relative",
        scrollSnapAlign: "start",
        scrollSnapStop: "always", // Forces the scroll to stop at this element
        backgroundColor: "#000",
        overflow: "hidden", // Prevent any accidental overflow
      }}
    >
      {/* IMAGE CAROUSEL (Horizontal Scroll) */}
      <div
        className="no-scrollbar" // <--- The class we added to index.css
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden", // Lock vertical scroll inside the card
          scrollSnapType: "x mandatory",
          height: "100%",
          width: "100%",
        }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            style={{
              minWidth: "100vw", // Use vw to guarantee full screen width
              height: "100%",
              scrollSnapAlign: "center",
              position: "relative",
            }}
          >
            {/* Dark overlay to make text readable */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)",
                zIndex: 1,
              }}
            />

            <img
              src={img.url}
              alt={img.description || data.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Ensures image fills screen without white bars
                objectPosition: "center",
              }}
            />

            {/* Image Counter */}
            {images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  zIndex: 2,
                  background: "rgba(0,0,0,0.6)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(4px)",
                }}
              >
                {index + 1} / {images.length}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* INFO OVERLAY */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "24px 20px 40px 20px", // Extra bottom padding for mobile safe areas
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
            lineHeight: "1.5",
            maxWidth: "90%",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {data.description}
        </p>
      </div>
    </div>
  );
}
