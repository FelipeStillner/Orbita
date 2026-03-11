import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import type { CredentialResponse } from "@react-oauth/google";
import { loginWithGoogleToken } from "./api/login";

export function useAuthViewModel() {
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

  return { error, handleSuccess };
}
