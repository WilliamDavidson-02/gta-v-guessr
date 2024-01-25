import { useEffect, useState } from "react";
import { Levels } from "../GameCreation";
import { AllowedRegions } from "../LocationForm";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import { DataTable } from "../DataTable";
import { columns } from "./Columns";

export type Games = {
  id: string;
  created_at: string;
  level: Levels;
  region: AllowedRegions;
  name: string;
};

export default function GamesTable() {
  const [games, setGames] = useState<Games[]>([]);

  useEffect(() => {
    const getGames = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, created_at, level, region, name")
        .eq("is_multiplayer", true)
        .is("started_at", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        toast.error("Failed to get games", {
          description:
            "There was an error while retrieving games, please refresh the page and try again.",
        });
        return;
      }

      setGames(data);
    };

    getGames();
  }, []);

  return (
    <div>
      <DataTable columns={columns} data={games} />
    </div>
  );
}
