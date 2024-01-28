import { ColumnDef } from "@tanstack/react-table";
import { Games } from "./GamesTable";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FormEvent, useState } from "react";
import { Label } from "@radix-ui/react-label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import axios from "../../axiosConfig";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<Games>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "level",
    header: "Level",
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => {
      const formatted = (row.getValue("region") as string).replace("_", " ");

      return <div className="capitalize">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const game = row.original;
      const [password, setPassword] = useState("");
      const [isPasswordValid, setIsPasswordValid] = useState({
        isSubmitted: false,
        isValid: false,
      });
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();

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
          setIsLoading(false);

          if (response.data.isValid) {
            navigate(game.id);
          }
        } catch (error) {
          toast.error("Failed to create new game", {
            description:
              "There was an error while handling your password please try creating a new game",
          });
          setIsLoading(false);
          return;
        }
      };

      return (
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" type="button">
                Join
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
                <Button
                  className="mt-4 w-full"
                  variant="secondary"
                  type="submit"
                >
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
    },
  },
];
