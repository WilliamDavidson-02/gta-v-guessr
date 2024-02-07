import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { MAX_GAME_ROUNDS } from "./Game";
import { calcDistance } from "@/lib/utils";
import { LatLng } from "@/pages/MapBuilder";
import { GameData, Location } from "@/hooks/useGame";
import { Dispatch, SetStateAction, useState } from "react";

type Props = {
  game: GameData | null;
  location: Location | null;
  cords: LatLng;
  round: number;
  playerPoints: number;
  isMultiplayer: boolean;
  hasPlayersGuessed: boolean;
  isLeader: boolean;
  setCords: Dispatch<SetStateAction<LatLng>>;
  setIsGameOver: Dispatch<SetStateAction<boolean>>;
  setShowResults: Dispatch<SetStateAction<boolean>>;
  getAllPlayerGuesses: () => Promise<void>;
  getNewLocation: () => Promise<void>;
};

export default function PointBoard({
  playerPoints,
  cords,
  setCords,
  location,
  isMultiplayer,
  hasPlayersGuessed,
  isLeader,
  game,
  round,
  setIsGameOver,
  setShowResults,
  getAllPlayerGuesses,
  getNewLocation,
}: Props) {
  const [isNewLocationLoading, setIsNewLocationLoading] = useState(false);

  const formatDistance = (): string => {
    if (!location) return "";
    const distance = calcDistance(location, cords);

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }

    return `${distance}m`;
  };

  const handelNewLocation = async () => {
    if (!game) return;
    if (round >= MAX_GAME_ROUNDS || playerPoints === 0) {
      getAllPlayerGuesses();
      setIsGameOver(true);
      return;
    }

    // Rest values
    setCords({ lat: 0, lng: 0 });

    setIsNewLocationLoading(true);
    await getNewLocation();
    setIsNewLocationLoading(false);
    setShowResults(false);
  };

  return (
    <Card className="mb-2 border-none bg-background/40 backdrop-blur-sm">
      <CardContent className="grid grid-cols-2 pt-6 text-center text-3xl font-semibold">
        <div className="text-yellow-500">{playerPoints}</div>
        <div className="text-blue-500">{formatDistance()}</div>
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
