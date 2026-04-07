import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import AppLayout from "./AppLayout";
import HomePage from "../features/home/HomePage";
import MapPage from "../features/map/MapPage";
import GuidesPage from "../features/guides/GuidesPage";
import GuideDetailPage from "../features/guides/GuideDetailPage";
import ProfilePage from "../features/profile/ProfilePage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/profile" />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "map", element: <MapPage /> },
      {
        path: "guides",
        element: (
          <ProtectedRoute>
            <GuidesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "guides/:guideId",
        element: (
          <ProtectedRoute>
            <GuideDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
]);
