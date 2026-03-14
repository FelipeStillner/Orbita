import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import AppLayout from "./AppLayout";
import HomePage from "../features/home/HomePage";
import MapPage from "../features/map/MapPage";
import CollectionsPage from "../features/collections/CollectionsPage";
import ProfilePage from "../features/profile/ProfilePage";
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
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "map", element: <MapPage /> },
      { path: "collections", element: <CollectionsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
