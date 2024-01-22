import { AllowedRegions, levels } from "./LocationForm";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import seg from "@/lib/seg.json";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { useEffect, useState } from "react";
import RegionCard from "./RegionCard";
import { cn } from "@/lib/utils";

const regions = seg.features.map((region) => region.properties.seg);

export default function GameCreation() {
  const [selectedRegion, setSelectedRegion] = useState<AllowedRegions>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const setCarouselApi = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    api.on("resize", setCarouselApi);

    setCarouselApi();
  }, [api]);

  return (
    <form className="flex w-full flex-col gap-4">
      <Carousel setApi={setApi} opts={{ align: "start" }}>
        <CarouselContent>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <RegionCard
              bgUrl="/satellite/0/0/0.png"
              region="All"
              className={cn({ "border-primary": !selectedRegion })}
              onClick={() => setSelectedRegion(null)}
            />
          </CarouselItem>
          {regions.map((region) => (
            <CarouselItem
              className="cursor-pointer sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={region}
            >
              <RegionCard
                bgUrl={`/thumbnails/${region}.jpg`}
                region={region.replace("_", " ")}
                className={cn({ "border-primary": region === selectedRegion })}
                onClick={() => setSelectedRegion(region as AllowedRegions)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mx-auto flex gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            onClick={() => api?.scrollTo(index)}
            key={index}
            className={cn("h-2.5 w-2.5 rounded-full bg-secondary", {
              "bg-primary": index + 1 === current,
            })}
          />
        ))}
      </div>
      <RadioGroup
        onValueChange={() => {}}
        defaultValue={levels[0]}
        className="flex gap-4"
      >
        {levels.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <RadioGroupItem id={level} value={level} />
            <Label htmlFor={level}>{level}</Label>
          </div>
        ))}
      </RadioGroup>
    </form>
  );
}
