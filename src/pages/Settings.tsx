import ProfileForm from "@/components/ProfileForm";
import ChangePassword from "@/components/auth/ChangePassword";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <section className="mx-auto flex max-w-[600px] flex-col gap-4">
      <ProfileForm />
      <Separator />
      <ChangePassword />
    </section>
  );
}
