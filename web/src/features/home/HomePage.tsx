import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Page, Text } from "../../components";

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

      <Button
        size="lg"
        onClick={() => navigate("/feed")}
        className="flex items-center gap-3"
      >
        <Text>Start Exploring</Text>
        <Text className="text-xl">→</Text>
      </Button>
    </Page>
  );
}
