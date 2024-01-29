import useUserContext from "@/hooks/useUserContext";
import useUsers, { Users } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";

export default function GameLobby() {
  const { id } = useParams() as { id: string };
  const { user } = useUserContext();
  const { users, presentUsers } = useUsers({ id });

  const isUserLeader = (users: Users[]) => {
    if (!users.length) return;
    const time = (date: string) => new Date(date).getTime();

    const sort = users.sort((a, b) => time(a.joined_at) - time(b.joined_at));

    return sort[0].id === user?.id;
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
      {isUserLeader(users) && (
        <div className="col-span-4 flex w-full items-end justify-center pb-20">
          <Button disabled={users.length > presentUsers.length} type="button">
            Start game
          </Button>
        </div>
      )}
    </div>
  );
}
