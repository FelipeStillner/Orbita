import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/home/HomePage";
import FeedPage from "../features/feed/FeedPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/feed",
    element: <FeedPage />,
  },
]);
