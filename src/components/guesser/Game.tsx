import Map from "../Map";
import { useState } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useResize from "@/hooks/useResize";
import { UploadImage } from "../UploadImage";
import { Button } from "../ui/button";
import { Location } from "@/hooks/useGame";

type GameProps = {
  location: Location | null;
};

export default function Game({ location }: GameProps) {
  const resize = useResize();
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      <div className="absolute bottom-4 left-4 z-20 w-full max-w-[334px] md:max-w-[500px]">
        <UploadImage
          className="drop-shadow-md"
          src={location ? location.image_path : ""}
        />
        <Button disabled={!cords.lat && !cords.lng} className="mt-2 w-full">
          Submit guess
        </Button>
      </div>
      <Map cords={cords} setCords={setCords} onResize={resize}></Map>
    </div>
  );
}
