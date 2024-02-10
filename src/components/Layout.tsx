import { cn } from "@/lib/utils";
import { ReactNode, Suspense } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { LoadingScreen } from "./Loading";

type LayoutProps = {
  children: ReactNode;
  className?: string;
};

export default function Layout({ children, className = "" }: LayoutProps) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="mx-auto max-w-[1440px] px-6">
        <Navigation />
        <main className={cn("min-h-[calc(100vh-96px)]", className)}>
          {children}
        </main>
      </div>
      <Footer />
    </Suspense>
  );
}
