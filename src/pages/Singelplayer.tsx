import Game from "@/components/guesser/Game";
import { useEffect, useState } from "react";
import { LatLng } from "./MapBuilder";
import useGameContext from "@/hooks/useGameContext";

export default function Singleplayer() {
  const {
    game,
    getGame,
    getPrevLocations,
    getPlayerPoints,
    getAllPlayerGuesses,
  } = useGameContext();
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    getGame();
  }, []);

  useEffect(() => {
    if (!game) return;
    if (game.ended_at) {
      setIsGameOver(true);
      getAllPlayerGuesses();
    }
    getPrevLocations();
    getPlayerPoints();
  }, [game]);

  return (
    <section className="h-[calc(100vh-96px)]">
      <Game
        isMultiplayer={false}
        hasPlayersGuessed={true}
        isLeader={true}
        cords={cords}
        setCords={setCords}
        showResults={showResults}
        setShowResults={setShowResults}
        isGameOver={isGameOver}
        setIsGameOver={setIsGameOver}
      />
    </section>
  );
}
