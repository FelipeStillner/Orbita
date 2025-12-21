import { Link } from "react-router-dom";

export default function FeedError() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>Location Required</h2>
      <p style={{ marginBottom: "20px", color: "#aaa", maxWidth: "300px" }}>
        We need your location to show you the best places nearby. Please enable
        location access in your browser settings.
      </p>
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "underline",
          fontSize: "1rem",
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}
