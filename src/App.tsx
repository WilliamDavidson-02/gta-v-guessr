import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoutes, AdminRoute } from "./lib/PrivateRoutes";
import UserContextProvider from "./context/UserContext";
import AdminStats from "./pages/AdminStats";
import MapBuilder from "./pages/MapBuilder";
import { Toaster } from "@/components/ui/sonner";

const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Guessr = lazy(() => import("./pages/Guessr"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/:form" element={<Auth />} />
          <Route element={<PrivateRoutes />}>
            <Route path="/guessr" element={<Guessr />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<AdminStats />} />
              <Route path="build" element={<MapBuilder />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </UserContextProvider>
    </BrowserRouter>
  );
}
