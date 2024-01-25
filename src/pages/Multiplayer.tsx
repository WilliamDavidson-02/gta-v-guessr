import GameCreation from "@/components/GameCreation";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import { useParams } from "react-router-dom";
import GamesTable from "@/components/multiplayer/GamesTable";

export default function Multiplayer() {
  const { id } = useParams();

  return (
    <Layout>
      <Navigation />
      <section className="flex h-[calc(100vh-96px)] flex-col gap-20">
        {id ? (
          <div>
            <h1>Lobby</h1>
          </div>
        ) : (
          <>
            <GameCreation />
            <GamesTable />
          </>
        )}
      </section>
    </Layout>
  );
}
