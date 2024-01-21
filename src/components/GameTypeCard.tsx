import { HTMLAttributes, Suspense, useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import TextLg from "./TextLg";
import { cn } from "@/lib/utils";

type GameTypeCardProps = HTMLAttributes<HTMLDivElement> & {
  bgUrl: string;
  gameType: string;
  description?: string;
  onClick: () => void;
};

export default function GameTypeCard({
  bgUrl,
  gameType,
  description,
  onClick,
}: GameTypeCardProps) {
  const [isPlayFocus, setIsPlayFocus] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Suspense fallback={<Skeleton />}>
      <div
        className="group h-full flex-grow select-none rounded-md border border-border bg-background bg-cover bg-center bg-no-repeat transition-all duration-300"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className="grid h-full grid-rows-12 p-4 transition-all duration-300 focus-within:bg-black/30 focus-within:backdrop-blur-sm group-hover:bg-black/30 group-hover:backdrop-blur-sm">
          <div className="row-span-1" />
          <div className="row-span-10 flex flex-col items-center justify-center gap-4 text-center">
            <TextLg>{gameType}</TextLg>
            <p
              className={cn(
                "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                { "opacity-100": isPlayFocus },
              )}
            >
              {description}
            </p>
          </div>
          <Button
            ref={btnRef}
            onClick={() => {
              onClick(); // parent function.
              btnRef.current?.blur();
            }}
            onFocus={() => setIsPlayFocus(true)}
            onBlur={() => setIsPlayFocus(false)}
            className="self-end p-0 text-xl font-semibold opacity-0 transition duration-300 focus:opacity-100 group-hover:opacity-100"
          >
            Play
          </Button>
        </div>
      </div>
    </Suspense>
  );
}
