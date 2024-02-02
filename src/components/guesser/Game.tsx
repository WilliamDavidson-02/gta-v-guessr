import Map from "../Map";
import { useState } from "react";
import { LatLng } from "@/pages/MapBuilder";
import useResize from "@/hooks/useResize";
import { UploadImage } from "../UploadImage";

export default function Game() {
  const resize = useResize();
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      <UploadImage
        className="absolute bottom-4 left-4 z-20 max-w-[334px] md:max-w-[500px]"
        src=""
      />
      <Map cords={cords} setCords={setCords} onResize={resize}></Map>
    </div>
  );
}
