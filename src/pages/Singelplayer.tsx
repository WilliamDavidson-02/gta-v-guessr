import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import Game from "@/components/guesser/Game";
import useGame from "@/hooks/useGame";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Singleplayer() {
  const { id } = useParams();
  const {
    getGame,
    location,
    game,
    playerPoints,
    setPlayerPoints,
    getNewLocation,
    round,
  } = useGame({ id } as { id: string });

  useEffect(() => {
    getGame();
  }, []);

  return (
    <Layout>
      <Navigation />
      <div className="h-[calc(100vh-96px)]">
        <Game
          location={location}
          game={game}
          playerPoints={playerPoints}
          setPlayerPoints={setPlayerPoints}
          getNewLocation={getNewLocation}
          round={round}
        />
      </div>
    </Layout>
  );
}
