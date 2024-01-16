import { LocationForm } from "@/components/LocationForm";
import Map from "@/components/Map";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/supabase/supabaseConfig";
import { Suspense, useEffect, useState } from "react";

export type LatLng = {
  lat: number;
  lng: number;
};

export type LocationType = {
  id: string;
  lat: number;
  lng: number;
  image_url: string;
};

export type Image = {
  file: File;
  url: string;
};

export default function MapBuilder() {
  const [mapResize, setMapResize] = useState(50); // range from 0 - 100
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [image, setImage] = useState<Image | null>(null);

  useEffect(() => {
    const getMarkedLocation = async () => {
      const { data, error } = await supabase.from("locations").select();

      if (error) {
        console.log(error);
        return;
      }

      setLocations(data);
    };

    getMarkedLocation();
  }, []);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <section className="h-full">
        <ResizablePanelGroup
          className="rounded-md border"
          direction="horizontal"
        >
          <ResizablePanel>
            <LocationForm image={image} setImage={setImage} />
          </ResizablePanel>
          <ResizableHandle className="border transition-colors duration-300 hover:border-white active:border-white" />
          <ResizablePanel onResize={(size) => setMapResize(size)}>
            <Suspense
              fallback={<Skeleton className="h-full w-full rounded-none" />}
            >
              <Map
                cords={cords}
                setCords={setCords}
                onResize={mapResize}
                locations={locations}
              />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
