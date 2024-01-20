import GameTypeCard from "@/components/GameTypeCard";
import GithubIcon from "@/components/GithubIcon";
import Layout from "@/components/Layout";
import { LoadingScreen } from "@/components/Loading";
import Navigation from "@/components/Navigation";
import TextLg from "@/components/TextLg";
import useUserContext from "@/hooks/useUserContext";

export default function Home() {
  const { user, isLoading } = useUserContext();

  if (isLoading) return <LoadingScreen />;

  return (
    <Layout>
      <Navigation />
      <section className="flex h-[calc(100vh-96px)] items-center justify-center lg:justify-between">
        {user ? (
          <div className="grid h-full w-full grid-rows-2 gap-4 pb-6 md:grid-cols-2 md:grid-rows-1">
            <GameTypeCard
              bgUrl="/single_player_game_type.jpg"
              gameType="Singleplayer"
              description="Test your knowledge of Los Santos in a single player game mode"
            />
            <GameTypeCard
              bgUrl="/multiplayer_game_type.jpg"
              gameType="Multiplayer"
              description="Play with others, and find out who knows Los Santos the best!"
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
  );
}
