import Footer from "@/components/Footer";
import GameCreation from "@/components/GameCreation";
import GameTypeCard from "@/components/GameTypeCard";
import GithubIcon from "@/components/GithubIcon";
import Layout from "@/components/Layout";
import { LoadingScreen } from "@/components/Loading";
import Navigation from "@/components/Navigation";
import TextLg from "@/components/TextLg";
import useUserContext from "@/hooks/useUserContext";
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
      <Layout>
        <Navigation />
        <section className="flex h-[calc(100vh-96px)] items-center justify-center lg:justify-between">
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
            <>
              <div className="flex flex-col gap-6">
                <TextLg>🚧 Gta GeoGuesser currently in development 🚧</TextLg>
                <p className="flex gap-2">
                  You can find the source code on my github
                  <GithubIcon
                    title="gta-v-guessr"
                    target="_blank"
                    href="https://github.com/WilliamDavidson-02/gta-v-guessr"
                  />
                </p>
              </div>
              <img
                className="hidden rounded-md lg:block"
                src="/satellite/0/0/0.png"
                alt="gta5 satellite map"
              />
            </>
          )}
        </section>
      </Layout>
      <Footer />
    </>
  );
}
