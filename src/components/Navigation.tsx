import { Link } from "react-router-dom";
import { Button } from "./ui/button";
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

export default function Navigation() {
  const { user, signOut } = useUserContext();

  return (
    <nav className="flex w-full items-center justify-between py-6">
      <Link to="/" reloadDocument>
        <img className="w-12" src="/gta_v_icon.svg" alt="Gta v logo" />
      </Link>
      {!user ? (
        <Link to="/auth/login" reloadDocument>
          <Button>Login</Button>
        </Link>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{user.user_metadata.username}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mx-6 w-64">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {user.user_metadata.access_role === "admin" && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="cursor-pointer">
                  <Link className="w-full" to="/admin" reloadDocument>
                    Admin
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem className="cursor-pointer">
              <Link
                className="flex w-full items-center gap-2"
                to="/"
                reloadDocument
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer">
              <Link className="w-full" to="/" reloadDocument>
                Single player
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link className="w-full" to="/multiplayer" reloadDocument>
                Multiplayer
              </Link>
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
