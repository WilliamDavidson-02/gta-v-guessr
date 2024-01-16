import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/supabase/supabaseConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  isLoading: boolean;
};

export const UserContext = createContext<UserContext | null>(null);

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isGettingUser = useRef(false);
  const navigate = useNavigate();

  const getUser = async () => {
    if (isGettingUser.current) return;
    isGettingUser.current = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      isGettingUser.current = false;
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      isGettingUser.current = false;
      setIsLoading(false);
      return;
    }
    setUser(data.user);
    setIsLoading(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  const signInWithPassword = async (credentials: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      toast.error("Failed Login: Invalid credentials.");
      return;
    }
    setUser(data.user);
    navigate("/");
  };

  const signUp = async (credentials: SignUpCredentials) => {
    const { email, password, username } = credentials;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, theme: "dark", access_role: "guessr" },
      },
    });
    if (error) {
      toast.error("Failed Registration: Pleas try again.");
      return;
    }
    setUser(data.user);
    navigate("/");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        signInWithPassword,
        signUp,
        signOut,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
