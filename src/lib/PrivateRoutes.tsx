import { LoadingScreen } from "@/components/Loading";
import useUserContext from "@/hooks/useUserContext";
import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoutes() {
  const { user } = useUserContext();

  if (!user) return <LoadingScreen />;

  return user ? <Outlet /> : <Navigate to="/auth/login" />;
}

export function AdminRoute() {
  const { user } = useUserContext();

  if (!user) return <LoadingScreen />;

  return user && user.user_metadata.access_role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
}
