import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Page, Button, Text } from "@components";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <Page className="space-y-6 px-6">
      <Text variant="h1">Profile</Text>
      <Text variant="body" muted>
        Manage your account
      </Text>
      <Button
        variant="default"
        size="lg"
        rounded={false}
        onClick={handleLogout}
        className="w-full max-w-xs"
      >
        Logout
      </Button>
    </Page>
  );
}
