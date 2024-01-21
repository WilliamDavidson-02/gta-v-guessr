import { AllowedRegions, levels } from "./LocationForm";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import seg from "@/lib/seg.json";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { useState } from "react";
import RegionCard from "./RegionCard";
import { cn } from "@/lib/utils";

const regions = seg.features.map((region) => region.properties.seg);

export default function GameCreation() {
  const [selectedRegion, setSelectedRegion] = useState<AllowedRegions>(null);

  return (
    <form className="flex w-full flex-col gap-4">
      <Carousel opts={{ align: "start" }}>
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
                region={region.split("_").join(" ")}
                className={cn({ "border-primary": region === selectedRegion })}
                onClick={() => setSelectedRegion(region as AllowedRegions)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
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
