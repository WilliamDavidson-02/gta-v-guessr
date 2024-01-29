import useUsers from "@/hooks/useUsers";
import { useParams } from "react-router-dom";

export default function GameLobby() {
  const { id } = useParams() as { id: string };
  const { users } = useUsers({ id });

  return <div className="flex flex-wrap gap-2"></div>;
}
