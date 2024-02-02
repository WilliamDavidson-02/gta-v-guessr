import { AllowedRegions } from "./LocationForm";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { z } from "zod";
import axios from "../axiosConfig";
import { levels } from "@/lib/level";

export type Levels = "easy" | "medium" | "hard";

type GameConfig = {
  region: AllowedRegions;
  level: Levels;
};

const regions = seg.features.map((region) => region.properties.seg);

const multiplayerSchema = z.object({
  name: z.string().min(2),
  password: z.string(),
});

export default function GameCreation() {
  const isMultiplayer = useLocation().pathname.split("/")[1] === "multiplayer"; // remove "/" from the pathname
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [gameName, setGameName] = useState("");
  const [password, setPassword] = useState("");
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    level: levels[0] as Levels,
    region: "all",
  });
  const [isFormValid, setIsFormValid] = useState(false); // Only for multiplayer

  const navigate = useNavigate();

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

  useEffect(() => {
    if (!isMultiplayer) return;

    setIsFormValid(
      multiplayerSchema.safeParse({ name: gameName, password }).success,
    );
  }, [gameName, setGameName, password, setPassword, isMultiplayer]);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();

    let submittedPassword = password;

    // Hash password
    if (isMultiplayer && password.length > 0) {
      try {
        const response = await axios.post("/hash", { password });
        submittedPassword = response.data.password;
      } catch (error) {
        toast.error("Failed to create new game", {
          description:
            "There was an error while handling your password please try creating a new game",
        });
        return;
      }
    }

    const { data, error } = await supabase
      .from("games")
      .insert({
        ...gameConfig,
        is_multiplayer: isMultiplayer,
        started_at: !isMultiplayer ? new Date().toISOString() : null,
        name: gameName,
        password: submittedPassword,
      })
      .select("id");

    if (error) {
      toast.error("Failed to create new game");
      return;
    }

    navigate(isMultiplayer ? data[0].id : `/singelplayer/${data[0].id}`);
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
                className={cn({
                  "border-primary": gameConfig.region === "all",
                })}
                onClick={() =>
                  setGameConfig((prev) => ({ ...prev, region: "all" }))
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
        className={cn("mx-auto w-full max-w-[500px]", {
          "grid max-w-none gap-4 md:grid-cols-2": isMultiplayer,
        })}
      >
        <Card className="flex flex-col justify-between">
          <div>
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
          </div>
          <CardFooter>
            <Button
              disabled={isMultiplayer && !isFormValid}
              className="w-full"
              type="submit"
            >
              {!isMultiplayer ? "Start game" : "Create game"}
            </Button>
          </CardFooter>
        </Card>
        {isMultiplayer && (
          <Card>
            <CardHeader>
              <CardDescription>
                Name your game so others can identify the game and make it only
                accessible for people that knows the password.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="pl-2" htmlFor="name">
                  Game name
                </Label>
                <Input
                  value={gameName}
                  onChange={(ev) => setGameName(ev.target.value)}
                  id="name"
                  name="name"
                  autoComplete="off"
                  placeholder="Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="pl-2" htmlFor="password">
                  <span>Password</span>
                  <strong className="ml-2 text-xs text-secondary">
                    (Optional)
                  </strong>
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  id="password"
                  name="password"
                  placeholder="Password"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
}
