import useUserContext from "@/hooks/useUserContext";
import supabase from "@/supabase/supabaseConfig";
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannelSendResponse,
} from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Users = {
  presence_ref: string;
  user_id: string;
  username: string;
};

export default function GameLobby() {
  const { id } = useParams() as { id: string };
  const { user } = useUserContext();
  const [users, setUsers] = useState<Users[]>([]);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const lobby = supabase.channel("lobbys", {
      config: { presence: { key: id } },
    });

    lobby.on(
      REALTIME_LISTEN_TYPES.PRESENCE,
      { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
      () => {
        const state = lobby.presenceState()[id] as Users[];
        console.log(state, "state");

        if (!state) return;

        setUsers(state);
        setIsSynced(true);
      },
    );

    lobby.subscribe(async (status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) return;

      const resp: RealtimeChannelSendResponse = await lobby.track({
        user_id: user?.id,
        username: user?.user_metadata.username,
      });

      console.log(resp);
    });

    return () => {
      supabase.removeChannel(lobby);
    };
  }, [id, user?.id, user?.user_metadata.username]);

  return (
    <div className="flex flex-wrap gap-2">
      {isSynced &&
        users.map((user) => (
          <div
            className="flex flex-col items-center justify-center"
            key={user.presence_ref}
          >
            {user.username}
          </div>
        ))}
    </div>
  );
}
