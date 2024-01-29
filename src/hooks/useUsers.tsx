import supabase from "@/supabase/supabaseConfig";
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useUserContext from "./useUserContext";
import { toast } from "sonner";

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
          console.log(state);

          setPresentUsers(
            (state as UserPresence[]).map((user) => user.user_id),
          );
        },
      )
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN },
        ({ key, newPresences }) => {
          console.log("join", key, newPresences);
        },
      )
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
        ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
        },
      )
      .subscribe(async (status) => {
        if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) return;
        await lobbys.track({ user_id: user?.id });
      });

    return () => {
      supabase.removeChannel(lobbys);
    };
  }, []);

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
