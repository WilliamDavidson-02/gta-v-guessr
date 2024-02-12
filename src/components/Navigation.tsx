import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useUserContext from "@/hooks/useUserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

export default function Navigation() {
  const { user, signOut, isLoading } = useUserContext();
  const navigate = useNavigate();

  return (
    <nav className="flex w-full items-center justify-between py-6">
      <Link to="/">
        <img className="w-10" src="/gta-v-icon.svg" alt="GtaV GeoGuessr" />
      </Link>
      {!user && isLoading ? (
        <Skeleton className="h-10 w-16" />
      ) : !user ? (
        <Link to="/auth/login">
          <Button>Login</Button>
        </Link>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback className="uppercase">
                {user?.user_metadata.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mx-6 w-64">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {user.user_metadata.access_role === "admin" && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => navigate("/admin")}
                  className="cursor-pointer"
                >
                  Admin
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <Settings size={16} />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => navigate("/")}
              className="cursor-pointer"
            >
              Single player
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/multiplayer")}
              className="cursor-pointer"
            >
              Multiplayer
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
