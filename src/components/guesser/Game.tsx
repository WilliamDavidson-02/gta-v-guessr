import Map, { LocationMarker } from "../Map";
import { useState } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useResize from "@/hooks/useResize";
import { UploadImage } from "../UploadImage";
import { Button } from "../ui/button";
import { GameData, Location } from "@/hooks/useGame";
import { Marker, Polyline } from "react-leaflet";
import { divIcon, icon } from "leaflet";
import useUserContext from "@/hooks/useUserContext";
import seg from "../../lib/seg.json";
import { calculateArea } from "@/lib/utils";

type GameProps = {
  location: Location | null;
  game: GameData | null;
};

const flagIcon = icon({
  iconUrl: "/flag_icon.svg",
  iconSize: [32, 32],
  iconAnchor: [6, 32],
});

export default function Game({ location, game }: GameProps) {
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

  const calcDistance = (cords: LatLng, location: LatLng): number => {
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

    let levelModifier;
    let score = 5000;
    const distance = calcDistance(location, cords);

    if (distance > 200) {
      // Calculate score with gaussian formula
      let area = 10000000;
      const region = seg.features.find(
        (feature) => feature.properties.seg === game?.region,
      );
      if (region) {
        area = calculateArea(region!.geometry.coordinates[0]);
      }

      switch (game?.level) {
        case "ease":
          levelModifier = 0.9;
          break;
        case "medium":
          levelModifier = 0.8;
          break;
        case "hard":
          levelModifier = 0.7;
          break;
        default:
          levelModifier = 1;
      }

      // Sigma is a modifier for the gaussian curve which effects how fast the curve goes down to zero
      const sigma = Math.floor((area / 7500) * levelModifier);

      score = Math.floor(score * Math.exp(-0.5 * (distance / sigma) ** 2));
    }

    console.log("score: ", score);
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
