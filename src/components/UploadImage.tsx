import { forwardRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

type ImageProps = {
  className?: string | undefined;
  src: string;
  alt?: string;
  skeletonClass?: string;
};

const UploadImage = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt = "", skeletonClass, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <>
        {isLoading && (
          <Skeleton className={cn("aspect-video w-full", skeletonClass)} />
        )}
        <img
          {...props}
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            "aspect-video w-full rounded-md object-cover object-center",
            className,
            { hidden: isLoading },
          )}
          onLoad={() => setIsLoading(false)}
        />
      </>
    );
  },
);

UploadImage.displayName = "UploadImage";

export { UploadImage };
