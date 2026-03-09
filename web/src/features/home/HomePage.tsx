import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Button, Page, Text } from "@components";

export default function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <Page className="space-y-8">
      <Button
        variant="ghost"
        size="sm"
        rounded={false}
        onClick={handleLogout}
        className="absolute top-8 right-8"
      >
        Logout
      </Button>

      <Text variant="h1">
        Orbita
      </Text>
      <Text variant="body">
        Your personal guide to discovering extraordinary places
      </Text>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button
          size="lg"
          onClick={() => navigate("/feed")}
          rounded={false}
          className="flex-1"
        >
          Start Exploring
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/collections")}
          rounded={false}
          className="flex-1"
        >
          My Collections
        </Button>
      </div>
    </Page>
  );
}
