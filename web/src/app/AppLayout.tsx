import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BottomBar, Button } from "@components";
import { MapIcon, HomeIcon, CollectionsIcon, ProfileIcon } from "@assets/icons";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isMap = location.pathname === "/map";
  const isCollections = location.pathname === "/collections";
  const isProfile = location.pathname === "/profile";

  return (
    <>
      <Outlet />
      <BottomBar>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/")}
        >
          <HomeIcon filled={isHome} />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/collections")}
        >
          <CollectionsIcon filled={isCollections} />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/map")}
        >
          <MapIcon filled={isMap} />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/profile")}
        >
          <ProfileIcon filled={isProfile} />
        </Button>
      </BottomBar>
    </>
  );
}
