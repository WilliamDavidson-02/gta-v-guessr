import supabase from "@/supabase/supabaseConfig";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type GameData = {
  is_multiplayer: boolean;
  region: string;
  level: string;
};

export default function useGame({ id }: { id: string }) {
  const [game, setGame] = useState<GameData | null>();
  const [round, setRound] = useState(1);
  const [prevLocations, setPrevLocations] = useState<string[]>([]);

  useEffect(() => {
    getPrevLocations();
  }, []);

  const getGame = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("started_at, is_multiplayer, region, level")
      .eq("id", id);

    if (error) {
      toast.error("Error getting game state");
      return;
    }

    setGame(data[0]);
  };

  const getPrevLocations = async () => {
    const { data, error } = await supabase
      .from("game_location")
      .select("location_id")
      .eq("game_id", id);

    if (error) {
      toast.error("Failed to get previous location", {
        description:
          "Error while retrieving previous locations, this could effect the next locations.",
      });
      return;
    }

    const locations = data.map((location) => location.location_id);
    setRound(locations.length + 1);
    setPrevLocations(locations);
  };

  //   const getNewLocation = async () => {
  //     const { data, error } = await supabase
  //       .from("locations")
  //       .select()
  //       .eq("level", game?.level)
  //       .eq("region", game?.region)
  //       .not("id", "in", `(${prevLocations.join(",")})`)
  //       .limit(1);

  //     if (error) {
  //       toast.error("Error getting new location");
  //       return;
  //     }

  //     console.log(game);

  //     getImageUrl(data[0].image_path);
  //   };

  //   const getImageUrl = async (path: string) => {
  //     const { data } = supabase.storage.from("image_views").getPublicUrl(path);
  //   };

  return { getGame, game, round };
}
