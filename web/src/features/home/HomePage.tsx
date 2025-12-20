import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🪐 Orbita</h1>
      <p style={{ marginBottom: "2rem", opacity: 0.8 }}>
        Discover the world, one swipe at a time.
      </p>

      <button
        onClick={() => navigate("/feed")}
        style={{
          padding: "12px 24px",
          fontSize: "1.2rem",
          borderRadius: "50px",
          border: "none",
          backgroundColor: "#fff",
          color: "#000",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Start Exploring
      </button>
    </div>
  );
}
