import GameCreation from "@/components/GameCreation";
import { useParams } from "react-router-dom";
import GamesTable from "@/components/multiplayer/GamesTable";
import GameLobby from "@/components/multiplayer/GameLobby";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import supabase from "@/supabase/supabaseConfig";
import { useEffect, useState } from "react";
import Game from "@/components/guesser/Game";
import useUsers from "@/hooks/useUsers";
import useGame from "@/hooks/useGame";
import { isUserLeader } from "@/lib/utils";
import useUserContext from "@/hooks/useUserContext";
import { LatLng } from "./MapBuilder";
import { toast } from "sonner";

export default function Multiplayer() {
  const { id } = useParams() as { id: string };
  const { user } = useUserContext();
  const { users, presentUsers, getUsers } = useUsers({ id });
  const {
    game,
    round,
    location,
    playerPoints,
    userGuesses,
    setPlayerPoints,
    setLocation,
    setRound,
    getGame,
    getNewLocation,
    getCurrentLocation,
    getPrevLocations,
    getPlayerPoints,
    getCurrentGuess,
    getAllPlayerGuesses,
    updateGameToEnded,
  } = useGame({ id });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hasPlayersGuessed, setHasPlayerGuessed] = useState(false);
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const startGameChanges = supabase.channel("game-state");

    startGameChanges
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${id}`,
        },
        (payload: { [key: string]: any }) => {
          setIsGameStarted(payload.new.started_at ? true : false);
        },
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: "*",
          schema: "public",
          table: "game_location",
          filter: `game_id=eq.${id}`,
        },
        (payload: { [key: string]: any }) => {
          getLocationOnUser(payload.new.location_id);
          setHasPlayerGuessed(false);
        },
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: "*",
          schema: "public",
          table: "guesses",
          filter: `game_id=eq.${id}`,
        },
        (payload: { [key: string]: any }) => {
          if (payload.new.points === 0) {
            setIsGameOver(true);
            updateGameToEnded();
            if (payload.new.user_id !== user?.id) {
              getAllPlayerGuesses();
            }
            getAllPlayerGuesses;
          }
          if (payload.new.user_id !== user?.id || isUserLeader(users, user)) {
            setHasPlayerGuessed(true);
          }
        },
      )
      .subscribe();

    if (id) getGame();

    return () => {
      supabase.removeChannel(startGameChanges);
    };
  }, [id]);

  useEffect(() => {
    if (!location || !game || !showResults) return;
    getHasPlayersGuessed(location.id, game.id);
  }, [location, game, showResults]);

  useEffect(() => {
    if (!game) return;
    if (game.started_at) {
      setIsGameStarted(true);
      getPrevLocations();
      getPlayerPoints();
    }
    if (game.ended_at) {
      setIsGameOver(true);
      getAllPlayerGuesses();
    }
  }, [game]);

  const getHasPlayersGuessed = async (locationId: string, gameId: string) => {
    if (!locationId || !gameId) return;
    const { data, error } = await supabase
      .from("guesses")
      .select("user_id")
      .eq("location_id", locationId)
      .eq("game_id", gameId);

    if (error) {
      toast.error("Error checking if all players has guessed");
      console.log(error);
      return;
    }

    if (data.length === 2) {
      setHasPlayerGuessed(true);
    }
  };

  // Function is called when leader gets a new location
  const getLocationOnUser = async (location_id: string) => {
    const users = await getUsers();
    if (users && !isUserLeader(users, user)) {
      setCords({ lat: 0, lng: 0 });
      setShowResults(false);
      setRound((prev) => prev + 1);
      setLocation(null);
      getCurrentLocation(location_id);
    }
  };

  return (
    <section className="flex flex-col gap-20">
      {isGameStarted ? (
        <Game
          location={location}
          game={game}
          playerPoints={playerPoints}
          setPlayerPoints={setPlayerPoints}
          getNewLocation={getNewLocation}
          round={round}
          isMultiplayer={true}
          hasPlayersGuessed={hasPlayersGuessed}
          isLeader={isUserLeader(users, user)}
          cords={cords}
          setCords={setCords}
          showResults={showResults}
          setShowResults={setShowResults}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          getCurrentGuess={getCurrentGuess}
          getAllPlayerGuesses={getAllPlayerGuesses}
          userGuesses={userGuesses}
          updateGameToEnd={updateGameToEnded}
        />
      ) : id ? (
        <GameLobby
          users={users}
          presentUsers={presentUsers}
          getNewLocation={getNewLocation}
        />
      ) : (
        <>
          <GameCreation />
          <GamesTable />
        </>
      )}
    </section>
  );
}
