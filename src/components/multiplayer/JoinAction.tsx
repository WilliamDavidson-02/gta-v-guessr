import { FormEvent, useState } from "react";
import { Games } from "./GamesTable";
import { useNavigate } from "react-router-dom";
import useUserContext from "@/hooks/useUserContext";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import axios from "../../axiosConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { REQUIRED_PLAYER_COUNT } from "@/hooks/useUsers";

export default function JoinAction({ game }: { game: Games }) {
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState({
    isSubmitted: false,
    isValid: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserContext();

  const addUserToGame = async () => {
    const { error } = await supabase.from("user_game").upsert({
      user_id: user?.id,
      game_id: game.id,
      joined_at: new Date(),
    });

    if (error) {
      toast.error("Error joining game", {
        description: "Please try rejoining again.",
      });
      return;
    }

    setIsLoading(false);
    navigate(game.id);
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();

    setIsPasswordValid((prev) => ({ ...prev, isSubmitted: true }));
    setIsLoading(true);

    try {
      const response = await axios.post("/verify", {
        userInput: password,
        hash: game.password,
      });
      setIsPasswordValid((prev) => ({
        ...prev,
        isValid: response.data.isValid,
      }));

      if (response.data.isValid) addUserToGame();
    } catch (error) {
      toast.error("Failed to create new game", {
        description:
          "There was an error while handling your password please try creating a new game",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            onClick={(ev) => {
              // if password is empty string join directly
              if (game.password === "") {
                ev.preventDefault();
                setIsLoading(true);
                addUserToGame();
              }
            }}
            disabled={
              game.users.length >= REQUIRED_PLAYER_COUNT &&
              !game.users.includes(user?.id || "")
            }
            variant="secondary"
            type="button"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Join"
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{game.name}</DialogTitle>
            <DialogDescription>{`Enter the password for ${game.name}, join whit out password if ${game.name} dose not require it.`}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-1" htmlFor="password">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="col-span-3"
              />
              {isPasswordValid.isSubmitted && !isPasswordValid.isValid && (
                <div className="col-span-4 text-sm text-destructive">
                  Invalid password, please try again.
                </div>
              )}
            </div>
            <Button className="mt-4 w-full" variant="secondary" type="submit">
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Join"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
