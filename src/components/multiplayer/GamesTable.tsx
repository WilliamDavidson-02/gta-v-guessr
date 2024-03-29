import { useEffect, useState } from "react";
import { Levels } from "../GameCreation";
import { AllowedRegions } from "../LocationForm";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { columns } from "./Columns";
import { useSearchParams } from "react-router-dom";
import usePaginationSearchParam from "@/hooks/usePaginationSearchParam";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";

export type Games = {
  id: string;
  created_at: string;
  level: Levels;
  region: AllowedRegions;
  name: string;
  password: string;
  users: string[];
};

export default function GamesTable() {
  const [games, setGames] = useState<Games[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const [searchParams] = useSearchParams();
  const setNewPagination = usePaginationSearchParam();

  useEffect(() => {
    getGameCount();

    const changes = supabase
      .channel("games-list-channel")
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `is_multiplayer=eq.${true}`,
        },
        () => getGames(),
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: "*",
          schema: "public",
          table: "user_game",
        },
        (payload: { [key: string]: any }): void => {
          const game_id = payload.new.game_id ?? payload.old.game_id;
          const user_id = payload.new.user_id ?? payload.old.user_id;

          filterGamePlayerCount(payload.eventType, game_id, user_id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(changes);
    };
  }, []);

  useEffect(() => {
    getGames();
  }, [searchParams]);

  const getPlayersInGames = async (
    gameIds: string[],
  ): Promise<{ game_id: string; user_ids: string[] }[]> => {
    const { data, error } = await supabase.rpc("get_player_users", {
      game_ids: gameIds,
    });

    if (error) {
      toast.error("Error fetching player counts");
      return [];
    }

    return data;
  };

  const calcRange = () => {
    let page = parseInt(searchParams.get("page") ?? "0");

    if (page < 0 || isNaN(page)) {
      page = 0;
      setNewPagination("page", page);
    }

    const from = page * 10;
    const to = from + 9;

    return { from, to };
  };

  const getGameCount = async () => {
    const { count, error } = await supabase
      .from("games")
      .select("", { count: "exact" })
      .eq("is_multiplayer", true)
      .is("started_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error counting games", {
        description:
          "Failed to get the number of games, please reload the page.",
      });
      return;
    }

    setGameCount(Math.ceil(count! / 10));
  };

  const getGames = async () => {
    const range = calcRange();

    const { data, error } = await supabase
      .from("games")
      .select("id, created_at, level, region, name, password")
      .eq("is_multiplayer", true)
      .is("started_at", null)
      .order("created_at", { ascending: false })
      .range(range.from, range.to);

    if (error) {
      toast.error("Failed to get games", {
        description:
          "There was an error while retrieving games, please refresh the page and try again.",
      });
      return;
    }

    const gameIdsMap: string[] = data.map((game) => game.id);

    const players = await getPlayersInGames(gameIdsMap);

    setGames(
      data.map((game) => ({
        ...game,
        users:
          players.find((playerGame) => playerGame.game_id === game.id)
            ?.user_ids || [],
      })),
    );
  };

  const filterGamePlayerCount = (
    eventType: string,
    game_id: string,
    user_id: string,
  ) => {
    setGames((prev) =>
      prev.map((game) => {
        if (game.id === game_id) {
          let usersArray = game.users;
          if (eventType === "DELETE") {
            usersArray = usersArray.filter((user) => user !== user_id);
          } else if (eventType === "INSERT") {
            usersArray.push(user_id);
          }

          return {
            ...game,
            users: usersArray,
          };
        }

        return game;
      }),
    );
  };

  return (
    <div>
      <DataTable columns={columns} data={games} length={gameCount} />
    </div>
  );
}
