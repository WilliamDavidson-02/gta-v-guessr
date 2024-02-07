import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UserGuesses } from "@/hooks/useGame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatDistance } from "@/lib/utils";
import { useEffect, useState } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useUserContext from "@/hooks/useUserContext";

type Props = {
  isMultiplayer: boolean;
  userGuesses: UserGuesses[];
  getAllPlayerGuesses: (locationId?: string) => Promise<void>;
};

type ScoreProps = {
  userGuesses: Guesses[];
  sum: number;
};

type Guesses = {
  guess: LatLng;
  location: LatLng;
  points: number;
};

type UsersScores = {
  key: string;
  username: string;
  userId: string;
  guesses: Guesses[];
  sum: number;
};

function UserScore({ userGuesses, sum }: ScoreProps) {
  return (
    <div className="flex flex-col gap-y-2">
      {userGuesses.map((userGuess, index) => (
        <div key={index} className="grid grid-cols-5">
          <div className="col-span-1 font-bold">{index + 1}</div>
          <div className="col-span-2 text-center text-yellow-500">
            {userGuess.points}
          </div>
          <div className="col-span-2 text-center text-blue-500">
            {formatDistance(userGuess.guess, userGuess.location)}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-5 font-bold">
        <div className="col-span-1">Sum:</div>
        <div className="col-span-2 text-center text-yellow-500">{sum}</div>
      </div>
    </div>
  );
}

export default function ScoreBoard({
  isMultiplayer,
  userGuesses,
  getAllPlayerGuesses,
}: Props) {
  const { user } = useUserContext();
  const [usersScores, setUsersScores] = useState<UsersScores[]>([]);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    getAllPlayerGuesses();
  }, []);

  useEffect(() => {
    const mapUsersScores = () => {
      if (!userGuesses) return;
      let mappedUsers: UsersScores[] = [];

      userGuesses.forEach((userGuess) => {
        const { guess, location, points, userId, key, username } = userGuess;
        const userIndex = mappedUsers.findIndex(
          (user) => user.userId === userId,
        );
        const currentGuess = { guess, location, points };

        if (userIndex !== -1) {
          mappedUsers[userIndex].guesses.push(currentGuess);
          mappedUsers[userIndex].sum += points;
          return;
        }

        const user = {
          key,
          username,
          userId,
          guesses: [currentGuess],
          sum: points,
        };

        mappedUsers.push(user);
      });

      if (isMultiplayer) {
        setWinner(() => {
          const [playerA, playerB] = mappedUsers;
          if (playerA.sum < playerB.sum) {
            return `Winner is ${playerB.username}!`;
          } else if (playerA.sum > playerB.sum) {
            return `Winner is ${playerA.username}!`;
          }
          return "Draw!";
        });
      }

      setUsersScores(mappedUsers);
    };

    mapUsersScores();
  }, [userGuesses]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mb-2 w-full" variant="outline">
          Score board
        </Button>
      </DialogTrigger>
      <DialogContent className="pt-10">
        <DialogHeader>
          <DialogTitle>Score board</DialogTitle>
        </DialogHeader>
        {isMultiplayer ? (
          <Tabs defaultValue={user?.id}>
            <TabsList className="w-full">
              {usersScores.map((userGuess) => (
                <TabsTrigger
                  className="w-full"
                  key={userGuess.key}
                  value={userGuess.userId}
                >
                  {userGuess.username}
                </TabsTrigger>
              ))}
            </TabsList>
            {usersScores.map((userGuess) => (
              <TabsContent key={userGuess.key} value={userGuess.userId}>
                <UserScore
                  userGuesses={userGuess.guesses}
                  sum={userGuess.sum}
                />
              </TabsContent>
            ))}
            <div className="mt-4 rounded-md bg-accent py-2 text-center text-xl font-semibold">
              {winner}
            </div>
          </Tabs>
        ) : (
          usersScores.length && (
            <UserScore
              userGuesses={usersScores[0].guesses}
              sum={usersScores[0].sum}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
