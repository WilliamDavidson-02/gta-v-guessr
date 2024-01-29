import supabase from "@/supabase/supabaseConfig";
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useUserContext from "./useUserContext";

type Users = {
  username: string;
  joined_at: string;
};

export default function useUsers({ id }: { id: string }) {
  const { user } = useUserContext();
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    const lobbys = supabase.channel("lobbys", {
      config: { presence: { key: id } },
    });

    lobbys
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
        () => {
          console.log(lobbys.presenceState()[id]);
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

        const pres = await lobbys.track({ user_id: user?.id });
        console.log(pres);
      });

    return () => {
      supabase.removeChannel(lobbys);
    };
  }, []);

  return { users };
}
