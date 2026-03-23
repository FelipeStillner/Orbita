import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@context/AuthContext";
import { Page, Button, Text } from "@components";
import { useState } from "react";
import type { CredentialResponse } from "@react-oauth/google";
import { loginWithGoogleToken } from "../auth/api/login";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSuccess = async (res: CredentialResponse) => {
    if (!res.credential) return;
    setError(null);
    try {
      const jwt = await loginWithGoogleToken(res.credential);
      login(jwt);
      navigate("/");
    } catch {
      setError("Sign in failed. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <Page className="text-center space-y-4 mx-4">
        <Text variant="h1">Orbita</Text>
        <Text variant="body" muted>
          Discover amazing places around you
        </Text>

        <div className="pt-6 max-w-md w-full">
          <GoogleLogin
            onSuccess={handleSuccess}
            theme="filled_blue"
            shape="pill"
            size="large"
          />
        </div>

        {error && (
          <Text variant="caption" className="text-red-600">
            {error}
          </Text>
        )}

        <Text variant="caption" muted>
          Sign in to start exploring
        </Text>
      </Page>
    );
  }

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
