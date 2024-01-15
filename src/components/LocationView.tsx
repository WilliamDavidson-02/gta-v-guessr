import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

type LocationViewProps = {
  url: string;
  alt?: string;
  className?: string;
};

export default function LocationView({
  url,
  alt = "",
  className,
}: LocationViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  if (!url) {
    return (
      <div
        className={cn(
          "aspect-video w-full rounded-md object-cover object-center",
          className,
        )}
      />
    );
  }

  return (
    <>
      {isLoading && (
        <Skeleton
          className={cn(
            "aspect-video w-full rounded-md object-cover object-center",
            className,
          )}
        />
      )}
      <img
        key={url}
        className={cn(
          "aspect-video w-full rounded-md object-cover object-center",
          className,
          isLoading ? "hidden" : "",
        )}
        src={url}
        alt={alt}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}
