import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Page, Text } from "../../components";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (res: CredentialResponse) => {
    if (res.credential) {
      login(res.credential);
      navigate("/");
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

      <Text variant="caption" muted>
        Sign in to start exploring
      </Text>
    </Page>
  );
}
