import useUserContext from "@/hooks/useUserContext";
import useUsers, { REQUIRED_PLAYER_COUNT, Users } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";

export default function GameLobby() {
  const { id } = useParams() as { id: string };
  const { user } = useUserContext();
  const { users, presentUsers } = useUsers({ id });
  const navigate = useNavigate();

  const isUserLeader = (users: Users[]) => {
    if (!users.length) return;
    const time = (date: string) => new Date(date).getTime();

    const sort = users.sort((a, b) => time(a.joined_at) - time(b.joined_at));

    return sort[0].id === user?.id;
  };

  const onLeave = async () => {
    const { error } = await supabase
      .from("user_game")
      .delete()
      .eq("user_id", user?.id)
      .eq("game_id", id);

    if (error) {
      toast.error("Error leaving game", {
        description:
          "There was a problem removing you from the game, please try again.",
      });
      return;
    }

    // If last player is leaving game remove game
    if (users.length <= 1 && users[0].id === user?.id) {
      await supabase.from("games").delete().eq("id", id);
    }

    navigate("/multiplayer");
  };

  return (
    <div className="grid h-full grid-cols-4">
      {users.map((user) => (
        <div
          key={user.id}
          className={cn("col-span-2 flex items-center justify-center", {
            "text-secondary": !presentUsers.includes(user.id),
          })}
        >
          {user.username}
        </div>
      ))}
      <div className="col-span-4 flex w-full items-end justify-center gap-4 pb-20">
        {isUserLeader(users) && (
          <Button
            disabled={
              users.length > presentUsers.length ||
              users.length < REQUIRED_PLAYER_COUNT
            }
            type="button"
          >
            Start game
          </Button>
        )}
        <Button onClick={onLeave} variant="destructive" type="button">
          Leave
        </Button>
      </div>
    </div>
  );
}
