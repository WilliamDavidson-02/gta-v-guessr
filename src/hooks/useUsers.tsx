import supabase from "@/supabase/supabaseConfig";
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useUserContext from "./useUserContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const REQUIRED_PLAYER_COUNT = 2;

export type Users = {
  id: string;
  username: string;
  joined_at: string;
};

type UserGame = {
  joined_at: string;
  profiles: { id: any; username: any };
};

type UserPresence = {
  user_id: string;
  presence_ref: string;
};

export default function useUsers({ id }: { id: string }) {
  const { user } = useUserContext();
  const [users, setUsers] = useState<Users[]>([]);
  const [presentUsers, setPresentUsers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();

    const lobbys = supabase.channel("lobbys", {
      config: { presence: { key: id } },
    });

    lobbys
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
        () => {
          const state = lobbys.presenceState()[id];
          if (!state) return;

          setPresentUsers(
            (state as UserPresence[]).map((user) => user.user_id),
          );
        },
      )
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN },
        () => getUsers(),
      )
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
        () => getUsers(),
      )
      .subscribe(async (status) => {
        if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) return;
        await lobbys.track({ user_id: user?.id });
      });

    return () => {
      supabase.removeChannel(lobbys);
    };
  }, []);

  useEffect(() => {
    // Check if the user that is signed in on client exists in users array
    if (!users.length) return;
    const foundUser = users.find((playerUser) => playerUser.id === user?.id);

    if (!foundUser) {
      toast.error("Failed to join game", {
        description:
          "You are not verified user in this game, please try rejoining the game.",
      });
      navigate("/multiplayer");
      return;
    }
  }, [users]);

  const getUsers = async () => {
    const { data, error } = await supabase
      .from("user_game")
      .select("joined_at, profiles(id, username)")
      .eq("game_id", id);

    if (error) {
      toast.error("Failed to get player data");
      return;
    }

    const formattedUsers = (data as unknown as UserGame[]).map((user) => {
      const {
        joined_at,
        profiles: { id, username },
      } = user;

      return { id, username, joined_at };
    });

    setUsers(formattedUsers);
  };

  return { users, presentUsers };
}
