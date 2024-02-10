import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoutes, AdminRoute } from "./lib/PrivateRoutes";
import UserContextProvider from "./context/UserContext";
import AdminStats from "./pages/AdminStats";
import MapBuilder from "./pages/MapBuilder";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/Layout";
import GameContextProvider from "./context/GameContext";

const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Singelplayer = lazy(() => import("./pages/Singelplayer"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Multiplayer = lazy(() => import("./pages/Multiplayer"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <BrowserRouter>
      <UserContextProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/:form" element={<Auth />} />
            <Route element={<PrivateRoutes />}>
              <Route
                path="/singelplayer/:id"
                element={
                  <GameContextProvider>
                    <Singelplayer />
                  </GameContextProvider>
                }
              />
              <Route
                path="/multiplayer/:id?"
                element={
                  <GameContextProvider>
                    <Multiplayer />
                  </GameContextProvider>
                }
              />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />}>
                <Route index element={<AdminStats />} />
                <Route path="build" element={<MapBuilder />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster />
      </UserContextProvider>
    </BrowserRouter>
  );
}
