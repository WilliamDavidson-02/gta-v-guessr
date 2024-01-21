import GameCreation from "@/components/GameCreation";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";

export default function Multiplayer() {
  return (
    <Layout>
      <Navigation />
      <section className="flex h-[calc(100vh-96px)] flex-wrap gap-4">
        <GameCreation />
      </section>
    </Layout>
  );
}
