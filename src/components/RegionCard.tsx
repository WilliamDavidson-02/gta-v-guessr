import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { HTMLAttributes } from "react";

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
  return (
    <Card
      {...props}
      style={{ backgroundImage: `url(${bgUrl})` }}
      className={cn(
        "flex aspect-video h-full cursor-pointer items-end overflow-hidden bg-cover bg-center bg-no-repeat text-xl font-semibold",
        className,
      )}
    >
      <CardContent className="w-full bg-secondary/75 px-4 py-1 text-center capitalize">
        {region}
      </CardContent>
    </Card>
  );
}
