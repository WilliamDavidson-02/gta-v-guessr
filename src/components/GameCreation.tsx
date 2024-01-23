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
import { FormEvent, useEffect, useState } from "react";
import RegionCard from "./RegionCard";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Levels = "easy" | "medium" | "hard";

type GameConfig = {
  region: AllowedRegions;
  level: Levels;
};

const regions = seg.features.map((region) => region.properties.seg);

export default function GameCreation() {
  const pathname = useLocation().pathname.split("/")[1]; // remove "/" from the pathname
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [password, setPassword] = useState("");
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    level: levels[0] as Levels,
    region: null,
  });

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

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();

    console.log({ password, ...gameConfig });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Carousel setApi={setApi} opts={{ align: "start" }}>
          <CarouselContent>
            <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <RegionCard
                bgUrl="/satellite/0/0/0.png"
                region="All"
                className={cn({ "border-primary": !gameConfig.region })}
                onClick={() =>
                  setGameConfig((prev) => ({ ...prev, region: null }))
                }
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
                  className={cn({
                    "border-primary": region === gameConfig.region,
                  })}
                  onClick={() =>
                    setGameConfig((prev) => ({
                      ...prev,
                      region: region as AllowedRegions,
                    }))
                  }
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
      </div>
      <div
        className={cn("grid grid-cols-1 gap-2 lg:grid-cols-2", {
          "lg:grid-cols-3": pathname !== "multiplayer",
        })}
      >
        <Card className={cn({ "lg:col-start-2": pathname !== "multiplayer" })}>
          <CardHeader>
            <CardTitle>Select a difficulty level</CardTitle>
            <CardDescription>
              The level effects picture, time limit and point scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              onValueChange={(level) =>
                setGameConfig((prev) => ({ ...prev, level: level as Levels }))
              }
              defaultValue={gameConfig.level}
              className="flex gap-4"
            >
              {levels.map((level) => (
                <div
                  key={level}
                  className="flex select-none items-center gap-2"
                >
                  <RadioGroupItem id={level} value={level} />
                  <Label htmlFor={level}>{level}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        {pathname === "multiplayer" && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Label
                  className="text-2xl font-semibold leading-none tracking-tight"
                  htmlFor="password"
                >
                  Password
                </Label>
              </CardTitle>
              <CardDescription>
                Others will be required to enter the password before joining
                your game.{" "}
                <strong>If left empty no password will be required.</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                id="password"
                type="password"
              />
            </CardContent>
          </Card>
        )}
      </div>
      <div
        className={cn("grid grid-cols-1 gap-2 lg:grid-cols-2", {
          "lg:grid-cols-3": pathname !== "multiplayer",
        })}
      >
        <Button
          type="submit"
          className={cn({ "lg:col-start-2": pathname !== "multiplayer" })}
        >
          {pathname !== "multiplayer" ? "Start game" : "Create game"}
        </Button>
        {pathname === "multiplayer" && (
          <Button type="button" variant="outline">
            Join game
          </Button>
        )}
      </div>
    </form>
  );
}
