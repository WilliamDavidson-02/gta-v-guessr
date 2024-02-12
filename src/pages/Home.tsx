import GameCreation from "@/components/GameCreation";
import GameTypeCard from "@/components/GameTypeCard";
import GithubIcon from "@/components/GithubIcon";
import { LoadingScreen } from "@/components/Loading";
import TextLg from "@/components/TextLg";
import { UploadImage } from "@/components/UploadImage";
import { Button } from "@/components/ui/button";
import useUserContext from "@/hooks/useUserContext";
import { cn } from "@/lib/utils";
import supabase from "@/supabase/supabaseConfig";
import { ArrowRight } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, isLoading } = useUserContext();
  const navigate = useNavigate();
  const [showGameCreation, setShowGameCreation] = useState(false);

  useEffect(() => {
    const keyMap = (ev: KeyboardEvent) => {
      const { key } = ev;

      if (key === "Escape") setShowGameCreation(false);
    };

    window.addEventListener("keydown", keyMap);

    return () => {
      window.removeEventListener("keydown", keyMap);
    };
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      {showGameCreation && (
        <div
          onClick={() => setShowGameCreation(false)}
          className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            className="mx-auto w-full max-w-[1440px] rounded-md border border-border bg-background p-4"
          >
            <GameCreation />
          </div>
        </div>
      )}
      <section
        className={cn("h-[calc(100vh-96px)]", {
          "flex items-center justify-center": !user,
        })}
      >
        {user ? (
          <div className="grid h-full w-full grid-rows-2 gap-4 pb-6 md:grid-cols-2 md:grid-rows-1">
            <GameTypeCard
              bgUrl="/single_player_game_type.jpg"
              gameType="Singleplayer"
              description="Test your knowledge of Los Santos in a single player game mode"
              onClick={() => setShowGameCreation(true)}
            />
            <GameTypeCard
              bgUrl="/multiplayer_game_type.jpg"
              gameType="Multiplayer"
              description="Play with others, and find out who knows Los Santos the best!"
              onClick={() => startTransition(() => navigate("/multiplayer"))}
            />
          </div>
        ) : (
          <GuestLandingPage />
        )}
      </section>
    </>
  );
}

function GuestLandingPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState(0);

  useEffect(() => {
    const getLocationCount = async () => {
      const { count } = await supabase
        .from("locations")
        .select("", { count: "exact" });

      if (count) setLocations(count);
    };

    getLocationCount();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <TextLg className="mb-4 text-primary">GtaV geo guesser</TextLg>
        <p>
          This is a location guessing game based on the GtaV game map. Play with
          your self or 1v1 some one else in the multiplayer game mode and see
          who knows the map more.
        </p>
        <p>
          This project is open source on{" "}
          <a
            href="https://github.com/WilliamDavidson-02/gta-v-guessr"
            target="_blank"
            className="font-semibold underline transition-colors duration-300 hover:text-primary"
          >
            Github
          </a>
          , fell free to contribute to the project if you have any great ideas.
        </p>
        <p>
          The game has 3 levels easy, medium and hard with a total of{" "}
          {!locations ? "over 60 locations" : locations} location to guess on
          and more to come.
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            className="col-span-2 sm:col-span-1"
            onClick={() => navigate("/auth/register")}
          >
            <span className="mr-4">Start guessing</span>
            <ArrowRight />
          </Button>
          <Button
            className="col-span-2 sm:col-span-1"
            onClick={() =>
              (window.location.href =
                "https://github.com/WilliamDavidson-02/gta-v-guessr")
            }
            variant="outline"
          >
            <span className="mr-4">Contribute</span>
            <GithubIcon />
          </Button>
        </div>
      </div>
      <UploadImage className="md:h-full" src="/multiplayer_game_type.jpg" />
    </div>
  );
}
