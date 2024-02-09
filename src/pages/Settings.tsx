import Footer from "@/components/Footer";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";

export default function Settings() {
  return (
    <>
      <Layout>
        <Navigation />
        <section className="min-h-[calc(100vh-96px)]">
          <ProfileForm />
        </section>
      </Layout>
      <Footer />
    </>
  );
}
