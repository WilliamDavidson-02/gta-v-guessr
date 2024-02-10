import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatDistance } from "@/lib/utils";
import { useEffect, useState } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useUserContext from "@/hooks/useUserContext";
import useGameContext from "@/hooks/useGameContext";

type Props = {
  isMultiplayer: boolean;
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

export default function ScoreBoard({ isMultiplayer }: Props) {
  const { user } = useUserContext();
  const { userGuesses, getAllPlayerGuesses, getPlayersInGame } =
    useGameContext();
  const [usersScores, setUsersScores] = useState<UsersScores[]>([]);
  const [winner, setWinner] = useState({ id: "", message: "" });

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

      if (isMultiplayer && mappedUsers.length) calcWinner(mappedUsers);

      setUsersScores(mappedUsers);
    };

    mapUsersScores();
  }, [userGuesses]);

  const calcWinner = async (mappedUsers: UsersScores[]) => {
    // If playerA gets 0 points first round before playerB as guessed mappedUsers will only contain playerA
    if (mappedUsers.length < 2) {
      const players = await getPlayersInGame();
      const player = players?.find(
        (player) => player.id !== mappedUsers[0].userId,
      );

      setWinner({
        id: mappedUsers[0].userId,
        message: `Winner is ${player?.username}`,
      });
      return;
    }

    let winner = { id: user!.id, message: "Draw!" };
    const [playerA, playerB] = mappedUsers;
    const getLastPoints = (guesses: Guesses[]): number => {
      return guesses[guesses.length - 1].points;
    };

    const lastA = getLastPoints(playerA.guesses);
    const lastB = getLastPoints(playerB.guesses);

    if (playerA.sum < playerB.sum || lastA === 0) {
      winner.message = `Winner is ${playerB.username}!`;
      winner.id = playerB.userId;
    } else if (playerA.sum > playerB.sum || lastB === 0) {
      winner.message = `Winner is ${playerA.username}!`;
      winner.id = playerA.userId;
    }

    setWinner(winner);
  };

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
          <Tabs defaultValue={winner.id}>
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
              {winner.message}
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
