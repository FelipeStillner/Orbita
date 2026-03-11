import { GoogleLogin } from "@react-oauth/google";
import { useAuthViewModel } from "./useAuthViewModel";
import { Page, Text } from "@components";

export default function AuthPage() {
  const { error, handleSuccess } = useAuthViewModel();

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
