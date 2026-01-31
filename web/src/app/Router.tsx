import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/home/HomePage";
import FeedPage from "../features/feed/FeedPage";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthPage from "../features/auth/AuthPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute><HomePage /></ProtectedRoute>,
  },
  {
    path: "/feed",
    element: <ProtectedRoute><FeedPage /></ProtectedRoute>,
  },
]);
