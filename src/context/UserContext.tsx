import { ReactNode, createContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/supabase/supabaseConfig";
import { useNavigate } from "react-router-dom";

type SignInCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = {
  email: string;
  password: string;
  username: string;
};

type UserContext = {
  user: User | null;
  signInWithPassword: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

export const UserContext = createContext<UserContext | null>(null);

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) return;
    console.log({ data, error });
    setUser(data.user);
  };

  useEffect(() => {
    getUser();
  }, []);

  const signInWithPassword = async (credentials: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) return;
    setUser(data.user);
    navigate("/");
  };

  const signUp = async (credentials: SignUpCredentials) => {
    const { email, password, username } = credentials;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173/",
        data: { username, theme: "dark", access_role: "admin" },
      },
    });
    if (error) return;
    setUser(data.user);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, signInWithPassword, signUp, signOut }}>
      {children}
    </UserContext.Provider>
  );
}
