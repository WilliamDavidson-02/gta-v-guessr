import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  className?: string;
};

export default function Layout({ children, className = "" }: LayoutProps) {
  return (
    <main className={cn("mx-auto max-w-[1440px] px-6", className)}>
      {children}
    </main>
  );
}
