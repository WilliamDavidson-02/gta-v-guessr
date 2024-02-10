import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { MAX_GAME_ROUNDS } from "./Game";
import { formatDistance } from "@/lib/utils";
import { LatLng } from "@/pages/MapBuilder";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useGameContext from "@/hooks/useGameContext";

type Props = {
  cords: LatLng;
  isMultiplayer: boolean;
  hasPlayersGuessed: boolean;
  isLeader: boolean;
  isGameOver: boolean;
  setCords: Dispatch<SetStateAction<LatLng>>;
  setIsGameOver: Dispatch<SetStateAction<boolean>>;
  setShowResults: Dispatch<SetStateAction<boolean>>;
};

export default function PointBoard({
  cords,
  setCords,
  isMultiplayer,
  hasPlayersGuessed,
  isLeader,
  setIsGameOver,
  setShowResults,
  isGameOver,
}: Props) {
  const {
    game,
    round,
    playerPoints,
    location,
    userGuesses,
    getNewLocation,
    getAllPlayerGuesses,
    updateGameToEnd,
  } = useGameContext();
  const [isNewLocationLoading, setIsNewLocationLoading] = useState(false);

  useEffect(() => {
    const getPlayerPointsForLocation = async () => {
      if (!isMultiplayer || !location || !hasPlayersGuessed) return;

      getAllPlayerGuesses(location.id);
    };

    getPlayerPointsForLocation();
  }, [hasPlayersGuessed, isMultiplayer, location]);

  const handelNewLocation = async () => {
    if (!game) return;
    if (round >= MAX_GAME_ROUNDS || playerPoints === 0) {
      getAllPlayerGuesses();
      updateGameToEnd();
      setIsGameOver(true);
      return;
    }

    setIsNewLocationLoading(true);
    setCords({ lat: 0, lng: 0 });
    setShowResults(false);
    await getNewLocation();
    setIsNewLocationLoading(false);
  };

  return (
    <Card className="mb-2 border-none bg-background/40 backdrop-blur-sm">
      <CardContent className="pt-6 text-center text-3xl font-semibold">
        {isMultiplayer && hasPlayersGuessed && !isGameOver && userGuesses ? (
          userGuesses.map((userGuess) => (
            <div className="grid grid-cols-3 gap-y-4" key={userGuess.key}>
              <div className="overflow-hidden text-ellipsis text-nowrap text-start">
                {userGuess.username}
              </div>
              <div className="text-yellow-500">{userGuess.points}</div>
              <div className="text-blue-500">
                {location &&
                  formatDistance(userGuess.guess, {
                    lat: location.lat,
                    lng: location.lng,
                  })}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2">
            <div className="text-yellow-500">{playerPoints}</div>
            <div className="text-blue-500">
              {location &&
                formatDistance(cords, { lat: location.lat, lng: location.lng })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          disabled={
            (isMultiplayer && !hasPlayersGuessed && round <= MAX_GAME_ROUNDS) ||
            (isMultiplayer && !isLeader && round < MAX_GAME_ROUNDS)
          }
          onClick={handelNewLocation}
          className="w-full"
        >
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
  );
}
