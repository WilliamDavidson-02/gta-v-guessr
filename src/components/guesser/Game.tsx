import Map, { LocationMarker } from "../Map";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
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
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GameProps = {
  location: Location | null;
  game: GameData | null;
  playerPoints: number;
  setPlayerPoints: Dispatch<SetStateAction<number>>;
  getNewLocation: () => Promise<void>;
  round: number;
};

type UserGuesses = {
  guess: LatLng;
  location: LatLng;
  userChar: string;
};

const flagIcon = icon({
  iconUrl: "/flag_icon.svg",
  iconSize: [32, 32],
  iconAnchor: [6, 32],
});

export const MAX_GAME_ROUNDS = 5;

export default function Game({
  location,
  game,
  playerPoints,
  setPlayerPoints,
  getNewLocation,
  round,
}: GameProps) {
  const resize = useResize();
  const { user } = useUserContext();
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isNewLocationLoading, setIsNewLocationLoading] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [userGuesses, setUserGuesses] = useState<UserGuesses[]>([]);
  const userIcon = divIcon({
    html: user?.user_metadata.username.charAt(0),
    className:
      "bg-background/50 backdrop-blur-sm rounded-full flex justify-center items-center text-lg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!game) return;
    if (playerPoints === 0) {
      getAllPlayerGuesses();
      setIsGameOver(true);
    }
  }, [game, playerPoints]);

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
    let score = playerPoints;
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

    setPlayerPoints(score);
    setShowResults(true);

    const { error } = await supabase.from("guesses").insert({
      game_id: game?.id,
      location_id: location.id,
      lat: cords.lat,
      lng: cords.lng,
      points: score,
    });

    if (error) {
      toast.error("Error while saving your guess.");
    }
  };

  const formatDistance = (): string => {
    const distance = calcDistance(location!, cords);

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }

    return `${distance}m`;
  };

  const getAllPlayerGuesses = async () => {
    const { data, error } = await supabase
      .from("guesses")
      .select("lat, lng, locations(lat, lng), profiles(username)")
      .eq("game_id", game?.id);

    if (error) {
      toast.error("Error getting player guesses");
      return;
    }

    const guesses: UserGuesses[] = data.map((guess) => {
      const { locations, profiles } = guess as { [key: string]: any };

      return {
        guess: { lat: guess.lat, lng: guess.lng },
        location: { lat: locations.lat, lng: locations.lng },
        userChar: profiles.username.charAt(0),
      };
    });

    setUserGuesses(guesses);
  };

  const handelNewLocation = async () => {
    if (round >= MAX_GAME_ROUNDS || playerPoints === 0) {
      getAllPlayerGuesses();
      setIsGameOver(true);
      return;
    }

    // Rest values
    setCords({ lat: 0, lng: 0 });
    setIsSubmitted(false);

    setIsNewLocationLoading(true);
    await getNewLocation();
    setIsNewLocationLoading(false);
    setShowResults(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      <Card className="absolute right-4 top-4 z-20 border-none bg-background/40 backdrop-blur-sm">
        <CardContent className="grid grid-cols-2 gap-4 p-2">
          <div>Round {`${round}/${MAX_GAME_ROUNDS}`}</div>
          <div>Points {playerPoints}</div>
        </CardContent>
      </Card>
      <div className="absolute bottom-4 left-4 z-20 w-full max-w-[334px] md:max-w-[500px]">
        {isGameOver ? (
          <Button
            onClick={() => startTransition(() => navigate("/"))}
            className="w-full"
          >
            Back to start
          </Button>
        ) : (
          <>
            {showResults && (
              <Card className="mb-2 border-none bg-background/40 backdrop-blur-sm">
                <CardContent className="grid grid-cols-2 pt-6 text-center text-3xl font-semibold">
                  <div className="text-yellow-500">{playerPoints}</div>
                  <div className="text-blue-500">{formatDistance()}</div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handelNewLocation} className="w-full">
                    {isNewLocationLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : round >= MAX_GAME_ROUNDS || playerPoints === 0 ? (
                      "Show results"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
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
          </>
        )}
      </div>
      <Map onResize={resize}>
        {isGameOver ? (
          userGuesses.map((userGuess) => (
            <div key={Math.abs(userGuess.location.lat * userGuess.guess.lng)}>
              <LocationMarker
                cords={userGuess.guess}
                setCords={setCords}
                icon={userIcon}
                isPinned={true}
              />
              <Polyline
                color="#ffab00"
                positions={[
                  [userGuess.location.lat, userGuess.location.lng],
                  [userGuess.guess.lat, userGuess.guess.lng],
                ]}
              />
              <Marker
                position={{
                  lat: userGuess.location.lat,
                  lng: userGuess.location.lng,
                }}
                icon={flagIcon}
              />
            </div>
          ))
        ) : (
          <>
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
          </>
        )}
      </Map>
    </div>
  );
}
