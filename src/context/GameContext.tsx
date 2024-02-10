import useUserContext from "@/hooks/useUserContext";
import { getImageUrl } from "@/lib/utils";
import { LatLng } from "@/pages/MapBuilder";
import supabase from "@/supabase/supabaseConfig";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export type GameData = {
  id: string;
  started_at: string;
  ended_at: string;
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

type Props = {
  children: ReactNode;
};

export type UserGuesses = {
  key: string;
  guess: LatLng;
  location: LatLng;
  userChar: string;
  username: string;
  userId: string;
  points: number;
};

type GameContextType = {
  round: number;
  game: GameData | null;
  location: Location | null;
  playerPoints: number;
  userGuesses: UserGuesses[];
  setPlayerPoints: Dispatch<SetStateAction<number>>;
  setRound: Dispatch<SetStateAction<number>>;
  setUserGuesses: Dispatch<SetStateAction<UserGuesses[]>>;
  setLocation: Dispatch<SetStateAction<Location | null>>;
  getGame: () => Promise<void>;
  getNewLocation: () => Promise<void>;
  getPrevLocations: () => Promise<void>;
  getPlayerPoints: () => Promise<void>;
  getCurrentLocation: (locationId: string) => Promise<void>;
  getAllPlayerGuesses: (locationId?: string) => Promise<void>;
  getCurrentGuess: (
    locationId: string,
    gameId: string,
    userId: string,
  ) => Promise<LatLng | undefined>;
  getPlayersInGame: () => Promise<
    | {
        id: string;
        username: string;
      }[]
    | undefined
  >;
  updateGameToEnd: () => Promise<void>;
};

export const GameContext = createContext<GameContextType | null>(null);

export default function GameContextProvider({ children }: Props) {
  const { id } = useParams() as { id: string };
  const { user } = useUserContext();
  const [game, setGame] = useState<GameData | null>(null);
  const [round, setRound] = useState(0);
  const [prevLocations, setPrevLocations] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [playerPoints, setPlayerPoints] = useState(5000);
  const [userGuesses, setUserGuesses] = useState<UserGuesses[]>([]);

  const navigate = useNavigate();

  // Get game is called in component where the hook is used due to checks if mp games are started.
  const getGame = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("id, started_at, is_multiplayer, region, level, ended_at")
      .eq("id", id);

    if (error) {
      toast.error("Error getting game state");
      navigate("/");
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
      .select("location_id, created_at")
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
      getNewLocation();
      return;
    }

    const locations = data.map((location) => location.location_id);
    setRound(locations.length);
    getCurrentLocation(locations[locations.length - 1]);
    setPrevLocations(locations);
  };

  const getCurrentLocation = async (locationId: string) => {
    if (game && game.ended_at) return;
    const { data, error } = await supabase
      .from("locations")
      .select("id, image_path, lat, lng")
      .eq("id", locationId);

    if (error) {
      toast.error("Error while getting current location");
      return;
    }

    data[0].image_path = getImageUrl("image_views", data[0].image_path);
    setLocation(data[0]);
  };

  const getCurrentGuess = async (
    locationId: string,
    gameId: string,
    userId: string,
  ) => {
    if (!locationId || !gameId || !userId) return;

    const { data, error } = await supabase
      .from("guesses")
      .select("lat, lng")
      .eq("location_id", locationId)
      .eq("game_id", gameId)
      .eq("user_id", userId);

    if (error) {
      console.log(error);
      toast.error("Error while getting current guess.");
      return;
    }

    return data[0];
  };

  const getNewLocation = async () => {
    if (!game) return;

    // Reset values, manly for image skeleton to shoe user new location is coming
    setLocation({ id: "", image_path: "", lat: 0, lng: 0 });

    let query = supabase
      .from("random_location")
      .select("id, image_path, lat, lng")
      .eq("level", game.level)
      .not("id", "in", `(${prevLocations.join(",")})`)
      .limit(1);

    if (game.region !== "all") {
      query = query.eq("region", game.region);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Error getting new location");
      return;
    }

    setPrevLocations((prev) => [...prev, data[0].id]); // Add this location to not select it for next round
    setRound((prev) => prev + 1);

    const { error: err } = await supabase
      .from("game_location")
      .insert({ game_id: id, location_id: data[0].id });

    if (err) {
      toast.error("Failed to save location");
      return;
    }

    data[0].image_path = getImageUrl("image_views", data[0].image_path);
    setLocation(data[0]);
  };

  const getPlayerPoints = async () => {
    const { data, error } = await supabase
      .from("guesses")
      .select("points")
      .eq("game_id", id)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      toast.error("Error while getting player pints");
      return;
    }

    if (!data.length) return;

    setPlayerPoints(data[0].points);
  };

  const getAllPlayerGuesses = async (locationId?: string) => {
    let query = supabase
      .from("guesses")
      .select(
        "user_id, location_id, lat, lng, points, locations(lat, lng), profiles(username)",
      )
      .eq("game_id", id);

    // Get both player guesses for mp of the set location
    if (locationId) {
      query = query.eq("location_id", locationId);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Error getting player guesses");
      return;
    }

    const guesses: UserGuesses[] = data.map((guess) => {
      const { locations, profiles, lat, lng, location_id, user_id, points } =
        guess as {
          [key: string]: any;
        };

      return {
        key: location_id + user_id,
        guess: { lat, lng },
        location: { lat: locations.lat, lng: locations.lng },
        userChar: profiles.username.charAt(0),
        username: profiles.username,
        userId: user_id,
        points,
      };
    });

    setUserGuesses(guesses);
  };

  const updateGameToEnd = async () => {
    const { error } = await supabase
      .from("games")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Error ending game", {
        description: "Failed to update the game ended time.",
      });
    }
  };

  const getPlayersInGame = async () => {
    const { data, error } = await supabase
      .from("user_game")
      .select("profiles(id, username)")
      .eq("game_id", id); // id from useParams, game id

    if (error) {
      toast.error("Error getting players in game");
      return;
    }

    const players = data.map((player: { [key: string]: any }) => ({
      id: player.profiles.id as string,
      username: player.profiles.username as string,
    }));

    return players;
  };

  return (
    <GameContext.Provider
      value={{
        game,
        round,
        location,
        playerPoints,
        setPlayerPoints,
        setRound,
        setUserGuesses,
        setLocation,
        getGame,
        getNewLocation,
        getCurrentLocation,
        getPrevLocations,
        getPlayerPoints,
        getCurrentGuess,
        getAllPlayerGuesses,
        getPlayersInGame,
        userGuesses,
        updateGameToEnd,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
