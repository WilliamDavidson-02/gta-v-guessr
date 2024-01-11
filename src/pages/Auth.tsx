import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/loginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function Auth() {
  const { form } = useParams();
  const navigate = useNavigate();

  return (
    <Layout className="flex h-screen items-center justify-center">
      <Tabs
        defaultValue={form}
        onValueChange={(ev) => navigate(`/auth/${ev}`)}
        className="mx-auto w-full max-w-[500px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="p-0" value="login">
            <Link className="w-full px-3 py-1.5" to="/auth/login">
              Login
            </Link>
          </TabsTrigger>
          <TabsTrigger className="p-0" value="register">
            <Link className="w-full px-3 py-1.5" to="/auth/register">
              Create account
            </Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
