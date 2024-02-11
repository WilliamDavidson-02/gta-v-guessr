import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import supabase from "@/supabase/supabaseConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";

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
  setUser: Dispatch<SetStateAction<User | null>>;
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

  useEffect(() => {
    getUser();
  }, []);

  const getUserProfileData = async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url, access_role")
      .eq("id", id);

    if (error) {
      toast.error("Failed to get profile data", {
        description:
          "Error while getting additional user meta data, please try again.",
      });
    }

    data![0].avatar_url = getImageUrl("avatar", data![0].avatar_url);

    return { user_metadata: data![0], profileError: error };
  };

  const getUser = async () => {
    if (isGettingUser.current) return;
    isGettingUser.current = true;

    const setErrors = () => {
      isGettingUser.current = false;
      setIsLoading(false);
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setErrors();
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      setErrors();
      return;
    }

    const { user_metadata, profileError } = await getUserProfileData(
      data.user.id,
    );

    if (profileError) {
      setErrors();
      return;
    }

    data.user.user_metadata = user_metadata;

    setUser(data.user);
    setIsLoading(false);
  };

  const signInWithPassword = async (credentials: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      toast.error("Failed Login: Invalid credentials.");
      return;
    }

    const { user_metadata, profileError } = await getUserProfileData(
      data.user.id,
    );

    if (profileError) return;

    data.user.user_metadata = user_metadata;

    setUser(data.user);
    navigate("/");
  };

  const signUp = async (credentials: SignUpCredentials) => {
    const { email, password, username } = credentials;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
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
        setUser,
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
