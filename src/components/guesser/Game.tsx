import Map, { LocationMarker } from "../Map";
import { useState } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useResize from "@/hooks/useResize";
import { UploadImage } from "../UploadImage";
import { Button } from "../ui/button";
import { Location } from "@/hooks/useGame";
import { Marker, Polyline } from "react-leaflet";
import { divIcon, icon } from "leaflet";
import useUserContext from "@/hooks/useUserContext";

type GameProps = {
  location: Location | null;
};

const flagIcon = icon({
  iconUrl: "/flag_icon.svg",
  iconSize: [32, 32],
  iconAnchor: [6, 32],
});

export default function Game({ location }: GameProps) {
  const resize = useResize();
  const { user } = useUserContext();
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const userIcon = divIcon({
    html: user?.user_metadata.username.charAt(0),
    className:
      "bg-background/50 backdrop-blur-sm rounded-full flex justify-center items-center text-lg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const calcDistance = (location: LatLng): number => {
    const diffLng = cords.lng - location.lng;
    const diffLat = cords.lat - location.lat;
    const distance = Math.floor(
      Math.sqrt(diffLng * diffLng + diffLat * diffLat),
    );

    return distance;
  };

  const handelSubmitGuess = async () => {
    if (!location) return;
    setIsSubmitted(true);

    const distance = calcDistance(location);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      <div className="absolute bottom-4 left-4 z-20 w-full max-w-[334px] md:max-w-[500px]">
        <UploadImage
          className="drop-shadow-md"
          src={location ? location.image_path : ""}
        />
        <Button
          type="button"
          onClick={handelSubmitGuess}
          disabled={(!cords.lat && !cords.lng) || isSubmitted}
          className="mt-2 w-full"
        >
          Submit guess
        </Button>
      </div>
      <Map onResize={resize}>
        <LocationMarker
          cords={cords}
          setCords={setCords}
          icon={userIcon}
          isPinned={isSubmitted}
        />
        {isSubmitted && location && (
          <>
            <Polyline
              color="#ffab00"
              positions={[
                [location.lat, location.lng],
                [cords.lat, cords.lng],
              ]}
            />
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              icon={flagIcon}
            />
          </>
        )}
      </Map>
    </div>
  );
}
