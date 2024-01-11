import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoutes, AdminRoute } from "./lib/PrivateRoutes";
import UserContextProvider from "./context/UserContext";

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
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserContextProvider>
    </BrowserRouter>
  );
}
