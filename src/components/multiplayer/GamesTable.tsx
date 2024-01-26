import { useEffect, useState } from "react";
import { Levels } from "../GameCreation";
import { AllowedRegions } from "../LocationForm";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { columns } from "./Columns";
import { useSearchParams } from "react-router-dom";

export type Games = {
  id: string;
  created_at: string;
  level: Levels;
  region: AllowedRegions;
  name: string;
};

export default function GamesTable() {
  const [games, setGames] = useState<Games[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getGameCount();
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") ?? "0");

    const from = page * 10;
    const to = from + 9;

    getGames(from, to);
  }, [searchParams]);

  const getGameCount = async () => {
    const { count, error } = await supabase
      .from("games")
      .select("", { count: "exact" })
      .eq("is_multiplayer", true)
      .is("started_at", null)
      .order("created_at", { ascending: false });

    if (error || !count) {
      toast.error("Error counting games", {
        description:
          "Failed to get the number of games, please reload the page.",
      });
      return;
    }

    setGameCount(Math.ceil(count / 10));
  };

  const getGames = async (from: number, to: number) => {
    const { data, error } = await supabase
      .from("games")
      .select("id, created_at, level, region, name")
      .eq("is_multiplayer", true)
      .is("started_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error("Failed to get games", {
        description:
          "There was an error while retrieving games, please refresh the page and try again.",
      });
      return;
    }

    setGames(data);
  };

  return (
    <div>
      <DataTable columns={columns} data={games} length={gameCount} />
    </div>
  );
}
