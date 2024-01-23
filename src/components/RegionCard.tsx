import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { HTMLAttributes, useState } from "react";
import { Skeleton } from "./ui/skeleton";

type RegionCardProps = HTMLAttributes<HTMLDivElement> & {
  bgUrl: string;
  region: string;
  className?: string;
};

export default function RegionCard({
  bgUrl,
  region,
  className,
  ...props
}: RegionCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <Card
      {...props}
      className={cn(
        "flex aspect-video h-full cursor-pointer items-end overflow-hidden text-xl font-semibold",
        className,
      )}
    >
      <CardContent className="relative h-full w-full p-0">
        {isLoading && <Skeleton className="aspect-video" />}
        <img
          className="h-full w-full object-cover object-center"
          src={bgUrl}
          alt={region}
          onLoad={() => setIsLoading(false)}
        />
        <div
          className={cn(
            "absolute bottom-0 w-full bg-secondary/75 px-4 py-1 text-center capitalize transition-opacity",
            { "opacity-0": isLoading },
          )}
        >
          {region}
        </div>
      </CardContent>
    </Card>
  );
}
