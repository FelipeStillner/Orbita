import axios from "axios";

interface LoginResponse {
  token: string;
}

export const loginWithGoogleToken = async (
  googleToken: string
): Promise<string> => {
  const { data } = await axios.post<LoginResponse>("/api/auth/login", {
    google_token: googleToken,
  });
  return data.token;
};
