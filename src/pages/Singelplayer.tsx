import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import Game from "@/components/guesser/Game";
import useGame from "@/hooks/useGame";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LatLng } from "./MapBuilder";

export default function Singleplayer() {
  const { id } = useParams();
  const {
    game,
    location,
    round,
    playerPoints,
    userGuesses,
    setPlayerPoints,
    setUserGuesses,
    getGame,
    getNewLocation,
    getPrevLocations,
    getPlayerPoints,
    getCurrentGuess,
    getAllPlayerGuesses,
  } = useGame({ id } as { id: string });
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    getGame();
  }, []);

  useEffect(() => {
    if (!game) return;
    getPrevLocations();
    getPlayerPoints();
  }, [game]);

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
          isMultiplayer={false}
          hasPlayersGuessed={true}
          isLeader={true}
          cords={cords}
          setCords={setCords}
          showResults={showResults}
          setShowResults={setShowResults}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          getCurrentGuess={getCurrentGuess}
          getAllPlayerGuesses={getAllPlayerGuesses}
          userGuesses={userGuesses}
          setUserGuesses={setUserGuesses}
        />
      </div>
    </Layout>
  );
}
