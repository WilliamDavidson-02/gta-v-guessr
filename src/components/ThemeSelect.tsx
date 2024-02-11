import { MoonStar, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

export default function ThemeSelect() {
  const [theme, setTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", update);

    update();
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  const update = () => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setTheme(true);
    } else {
      document.documentElement.classList.remove("dark");
      setTheme(false);
    }
  };

  const updateTheme = (theme: Theme) => {
    if (["light", "dark"].includes(theme)) {
      localStorage.setItem("theme", theme);
      setTheme(theme === "dark" ? true : false);
    } else {
      localStorage.removeItem("theme");
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    update();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2">
          {theme ? <MoonStar size={24} /> : <Sun size={24} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => updateTheme("light")}
          className="cursor-pointer"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateTheme("dark")}
          className="cursor-pointer"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateTheme("system")}
          className="cursor-pointer"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
