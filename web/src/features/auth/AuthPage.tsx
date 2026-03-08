import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Page, Text } from "../../components";
import { loginWithGoogleToken } from "./api/login";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Page
      className="text-center space-y-4 mx-4">
      <Text variant="h1">
        Orbita
      </Text>
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
