import AdminLocationForm from "@/components/AdminLocationForm";
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

export const bucketPath = `${
  import.meta.env.VITE_SUPABASE_URL
}/storage/v1/object/public/image_views/`;

export default function MapBuilder() {
  const [mapResize, setMapResize] = useState(50); // range from 0 - 100
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [previewUrl, setPreviewUrl] = useState("");
  const [locations, setLocations] = useState<LocationType[]>([]);

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
            <AdminLocationForm
              setPreviewUrl={setPreviewUrl}
              previewUrl={previewUrl}
              cords={cords}
              setCords={setCords}
            />
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
                setPreviewUrl={setPreviewUrl}
              />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
