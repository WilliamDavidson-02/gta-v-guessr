import { MoonStar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function ThemeSelect() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2">
          <MoonStar size={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer">Light</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Dark</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
