import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a", color: "white" }}>
      <button
        onClick={handleLogout}
        style={{ position: "absolute", top: "20px", right: "20px", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }}
      >
        Logout
      </button>

      <h1>🪐 Orbita</h1>
      <button onClick={() => navigate("/feed")} style={{ marginTop: "20px", padding: "12px 24px", borderRadius: "50px", fontWeight: "bold" }}>
        Start Exploring
      </button>
    </div>
  );
}