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

export default function Multiplayer() {
  const { id } = useParams();
  const { getGame } = useGame({ id } as { id: string });
  const { users, presentUsers } = useUsers({ id } as { id: string });
  const [isGameStarted, setIsGameStarted] = useState(false);

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
      .subscribe();

    if (isGameStarted) getGame();

    return () => {
      supabase.removeChannel(startGameChanges);
    };
  }, []);

  return (
    <Layout>
      <Navigation />
      <section className="flex h-[calc(100vh-96px)] flex-col gap-20">
        {isGameStarted ? (
          <Game />
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
