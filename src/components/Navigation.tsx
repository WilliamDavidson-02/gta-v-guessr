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
import { LogOut } from "lucide-react";
import { DropdownMenuShortcut } from "./ui/dropdown-menu";

export default function Navigation() {
  const { user, signOut } = useUserContext();

  return (
    <nav className="flex w-full justify-between py-6">
      <Link to="/" reloadDocument>
        <img src="/gta_v_icon.svg" alt="Gta v logo" />
      </Link>
      {!user ? (
        <Button>
          <Link to="/auth/login" reloadDocument>
            Login in
          </Link>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">User</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {user.user_metadata.access_role === "admin" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Link className="w-full" to="/admin" reloadDocument>
                    Admin
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Single player
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Multiplayer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
