import Footer from "@/components/Footer";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";
import ChangePassword from "@/components/auth/ChangePassword";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <>
      <Layout>
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-[600px] flex-col gap-4">
          <ProfileForm />
          <Separator />
          <ChangePassword />
        </section>
      </Layout>
      <Footer />
    </>
  );
}
