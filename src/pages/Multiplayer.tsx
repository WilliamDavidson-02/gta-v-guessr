import GameCreation from "@/components/GameCreation";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
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

export default function Multiplayer() {
  const { id } = useParams() as { id: string };
  const { user } = useUserContext();
  const { users, presentUsers, getUsers } = useUsers({ id });
  const {
    game,
    round,
    location,
    playerPoints,
    setPlayerPoints,
    setRound,
    getGame,
    getNewLocation,
    getCurrentLocation,
    getPrevLocations,
    getPlayerPoints,
  } = useGame({ id });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hasPlayersGuessed, setHasPlayerGuessed] = useState(false);
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const getLocationOnUser = async (location_id: string) => {
    const users = await getUsers();
    if (users && !isUserLeader(users, user)) {
      setCords({ lat: 0, lng: 0 });
      setShowResults(false);
      setIsSubmitted(false);
      setRound((prev) => prev + 1);
      getCurrentLocation(location_id);
    }
  };

  useEffect(() => {
    setHasPlayerGuessed(false);
  }, [location]);

  useEffect(() => {
    if (!game) return;
    if (game.started_at) setIsGameStarted(true);
    getPrevLocations();
    getPlayerPoints();
  }, [game]);

  return (
    <Layout>
      <Navigation />
      <section className="flex h-[calc(100vh-96px)] flex-col gap-20">
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
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
          />
        ) : id ? (
          <GameLobby users={users} presentUsers={presentUsers} />
        ) : (
          <>
            <GameCreation />
            <GamesTable />
          </>
        )}
      </section>
    </Layout>
  );
}
