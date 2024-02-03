import supabase from "@/supabase/supabaseConfig";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type GameData = {
  is_multiplayer: boolean;
  region: string;
  level: string;
};

export type Location = {
  id: string;
  image_path: string;
  lat: number;
  lng: number;
};

export default function useGame({ id }: { id: string }) {
  const [game, setGame] = useState<GameData | null>(null);
  const [round, setRound] = useState(1);
  const [prevLocations, setPrevLocations] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    getPrevLocations();
  }, []);

  // Get game is called in component where the hook is used due to checks if mp games are started.
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

  /*
  Get all previous locations to -
  Check how many round player has played
  Filter out already used locations for selection of new location
   */
  const getPrevLocations = async () => {
    const { data, error } = await supabase
      .from("game_location")
      .select("location_id, created_at, ended_at")
      .order("created_at", { ascending: true })
      .eq("game_id", id);

    if (error) {
      toast.error("Failed to get previous location", {
        description:
          "Error while retrieving previous locations, this could effect the next locations.",
      });
      return;
    }

    if (!data.length) {
      // No prev locations = first round, get new location
      getNewLocation();
      return;
    }

    const locations = data.map((location) => location.location_id);

    getCurrentLocation(locations[locations.length - 1]);

    setRound(() => {
      const locationCompleted = data.filter((location) => location.ended_at);
      return locationCompleted.length + 1;
    });
    setPrevLocations(locations);
  };

  const getCurrentLocation = async (locationId: string) => {
    if (!game) return;

    const { data, error } = await supabase
      .from("locations")
      .select("id, image_path, lat, lng")
      .eq("id", locationId);

    if (error) {
      toast.error("Error while getting current location");
      return;
    }

    data[0].image_path = await getImageUrl(data[0].image_path);
    setLocation(data[0]);
  };

  const getNewLocation = async () => {
    if (!game) return;

    const { data, error } = await supabase
      .from("locations")
      .select("id, image_path, lat, lng")
      .eq("level", game.level)
      .eq("region", game.region)
      .not("id", "in", `(${prevLocations.join(",")})`)
      .limit(1);

    if (error) {
      toast.error("Error getting new location");
      return;
    }

    const { error: err } = await supabase
      .from("game_location")
      .insert({ game_id: id, location_id: data[0].id });

    if (err) {
      toast.error("Failed to save location");
      return;
    }

    data[0].image_path = await getImageUrl(data[0].image_path);
    setLocation(data[0]);
  };

  const getImageUrl = async (path: string): Promise<string> => {
    const { data } = supabase.storage.from("image_views").getPublicUrl(path);
    return data.publicUrl;
  };

  return { getGame, game, round, location };
}
