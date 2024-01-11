import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import TextLg from "@/components/TextLg";

export default function Home() {
  return (
    <Layout>
      <Navigation />
      <section className="flex h-[calc(100vh-96px)] items-center justify-center lg:justify-between">
        <div className="flex flex-col gap-6">
          <TextLg>🚧 Gta GeoGuesser</TextLg>
          <TextLg>currently in development 🚧</TextLg>
        </div>
        <img
          className="hidden rounded-md lg:block"
          src="/satellite/0/0/0.png"
          alt="gta5 satellite map"
        />
      </section>
    </Layout>
  );
}
