import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { BottomBar, Button } from "@components";
import { MapIcon, HomeIcon, CollectionsIcon, ProfileIcon } from "@assets/icons";
import PlaceDetailDrawer from "../features/place/PlaceDetailDrawer";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isHome = location.pathname === "/";
  const isMap = location.pathname === "/map";
  const isGuides =
    location.pathname === "/guides" || location.pathname.startsWith("/guides/");
  const isProfile = location.pathname === "/profile";

  const placeId = searchParams.get("place");
  const showPlaceDrawer =
    (isHome || isMap || isGuides) && !!placeId;

  const closePlaceDrawer = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("place");
        return next;
      },
      { replace: true }
    );
  };

  return (
    <>
      <Outlet />
      {showPlaceDrawer && (
        <PlaceDetailDrawer
          open={showPlaceDrawer}
          placeId={placeId}
          onClose={closePlaceDrawer}
        />
      )}
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
          onClick={() => navigate("/guides")}
        >
          <CollectionsIcon filled={isGuides} />
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
