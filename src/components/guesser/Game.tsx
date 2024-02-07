import Map, { Cords, LocationMarker } from "../Map";
import { Dispatch, SetStateAction, useEffect } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useResize from "@/hooks/useResize";
import { UploadImage } from "../UploadImage";
import { Button } from "../ui/button";
import { GameData, Location, UserGuesses } from "@/hooks/useGame";
import { Marker, Polyline } from "react-leaflet";
import { divIcon, icon } from "leaflet";
import useUserContext from "@/hooks/useUserContext";
import seg from "../../lib/seg.json";
import { calcDistance, calculateArea } from "@/lib/utils";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Link } from "react-router-dom";
import PointBoard from "./PointBoard";
import ScoreBoard from "./ScoreBoard";

type GameProps = Cords & {
  round: number;
  game: GameData | null;
  location: Location | null;
  playerPoints: number;
  isGameOver: boolean;
  showResults: boolean;
  isMultiplayer: boolean;
  hasPlayersGuessed: boolean;
  isLeader: boolean;
  userGuesses: UserGuesses[];
  setPlayerPoints: Dispatch<SetStateAction<number>>;
  setIsGameOver: Dispatch<SetStateAction<boolean>>;
  setShowResults: Dispatch<SetStateAction<boolean>>;
  getNewLocation: () => Promise<void>;
  getAllPlayerGuesses: (locationId?: string) => Promise<void>;
  getCurrentGuess: (
    locationId: string,
    gameId: string,
    userId: string,
  ) => Promise<LatLng | undefined>;
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
  isMultiplayer,
  hasPlayersGuessed,
  isLeader,
  cords,
  setCords,
  showResults,
  setShowResults,
  isGameOver,
  setIsGameOver,
  getCurrentGuess,
  getAllPlayerGuesses,
  userGuesses,
}: GameProps) {
  const resize = useResize();
  const { user } = useUserContext();

  useEffect(() => {
    if (!game) return;
    if (playerPoints === 0) {
      getAllPlayerGuesses();
      setIsGameOver(true);
    }
  }, [game, playerPoints]);

  useEffect(() => {
    if (!game || !location || !user) return;
    const handleGuessedOnReload = async () => {
      const currentGuess = await getCurrentGuess(location.id, game.id, user.id);

      if (!currentGuess) return;

      setCords(currentGuess);
      setShowResults(true);
    };

    handleGuessedOnReload();
  }, [game, location, user]);

  const userIcon = (char: string) => {
    return divIcon({
      html: char,
      className:
        "bg-background/50 backdrop-blur-sm rounded-full flex justify-center items-center text-lg",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const handelSubmitGuess = async () => {
    if (!location) return;

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
          <>
            <ScoreBoard
              isMultiplayer={isMultiplayer}
              userGuesses={userGuesses}
              getAllPlayerGuesses={getAllPlayerGuesses}
            />
            <Button className="w-full p-0">
              <Link
                to={isMultiplayer ? "/multiplayer" : "/"}
                reloadDocument
                className="w-full px-4 py-2 outline-none"
              >
                Back to start
              </Link>
            </Button>
          </>
        ) : (
          <>
            {showResults ? (
              <PointBoard
                game={game}
                location={location}
                cords={cords}
                round={round}
                playerPoints={playerPoints}
                userGuesses={userGuesses}
                setCords={setCords}
                setIsGameOver={setIsGameOver}
                setShowResults={setShowResults}
                getAllPlayerGuesses={getAllPlayerGuesses}
                getNewLocation={getNewLocation}
                isMultiplayer={isMultiplayer}
                hasPlayersGuessed={hasPlayersGuessed}
                isLeader={isLeader}
                isGameOver={isGameOver}
              />
            ) : (
              <>
                <UploadImage
                  className="drop-shadow-md"
                  src={location ? location.image_path : ""}
                />
                <Button
                  type="button"
                  onClick={handelSubmitGuess}
                  disabled={!cords.lat && !cords.lng}
                  className="mt-2 w-full"
                >
                  Submit guess
                </Button>
              </>
            )}
          </>
        )}
      </div>
      <Map onResize={resize}>
        {isGameOver ||
        (isMultiplayer && userGuesses && showResults && hasPlayersGuessed) ? (
          userGuesses.map((userGuess) => (
            <div key={userGuess.key}>
              <LocationMarker
                cords={userGuess.guess}
                setCords={setCords}
                icon={userIcon(userGuess.userChar)}
                isPinned={true}
              />
              <Polyline
                color={userGuess.userId === user?.id ? "#ffab00" : "#ff4848"}
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
              icon={userIcon(user?.user_metadata.username.charAt(0))}
              isPinned={showResults}
            />
            {showResults && location && (
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
