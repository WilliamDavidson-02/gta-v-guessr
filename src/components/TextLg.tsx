import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

type TextLgProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  className?: string;
};

export default function TextLg({
  children,
  className = "",
  ...props
}: TextLgProps) {
  return (
    <h1 {...props} className={cn("text-5xl font-bold", className)}>
      {children}
    </h1>
  );
}
