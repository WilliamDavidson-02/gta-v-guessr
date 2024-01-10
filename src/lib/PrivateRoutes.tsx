import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoutes() {
  let auth = { token: false };

  return auth.token ? <Outlet /> : <Navigate to="/login" />;
}

export function AdminRoute() {
  let auth = { token: false, role: "user" };

  return auth.token && auth.role === "admin" ? <Outlet /> : <Navigate to="/" />;
}
