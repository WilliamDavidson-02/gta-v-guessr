import { ReactNode, createContext, useContext, useState } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/supabase/supabaseConfig";

type Credentials = {
  email: string;
  password: string;
};

type UserContext = {
  user: User | null;
  signInWithPassword: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

export const UserContext = createContext<UserContext | null>(null);

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const signInWithPassword = async (credentials: Credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    console.log({ data, error });
    setUser(data.user);
  };

  const signUp = async (credentials: Credentials) => {
    const { data, error } = await supabase.auth.signUp(credentials);
    console.log({ data, error });
    setUser(data.user);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    console.log(error);
  };

  return (
    <UserContext.Provider value={{ user, signInWithPassword, signUp, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
};
