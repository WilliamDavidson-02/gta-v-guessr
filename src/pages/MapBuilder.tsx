import { LocationForm } from "@/components/LocationForm";
import Map from "@/components/Map";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileBlobFromUrl } from "@/lib/utils";
import supabase from "@/supabase/supabaseConfig";
import { Suspense, useEffect, useState } from "react";
import { Marker } from "react-leaflet";
import { toast } from "sonner";

export type LatLng = {
  lat: number;
  lng: number;
};

export type LocationType = {
  id: string;
  lat: number;
  lng: number;
  level: string;
  image_path: string;
};

export type ImageType = {
  file: File;
  url: string;
};

export default function MapBuilder() {
  const [mapResize, setMapResize] = useState(50);
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [image, setImage] = useState<ImageType | null>(null);
  const [pinMap, setPinMap] = useState(false);
  const [activeLocation, setActiveLocation] = useState<LocationType | null>(
    null,
  );

  useEffect(() => {
    const getMarkedLocation = async () => {
      const { data, error } = await supabase.from("locations").select();

      if (error) {
        toast.error("Error while getting locations.");
        return;
      }

      setLocations(data);
    };

    getMarkedLocation();
  }, []);

  const getImageFile = async (path: string) => {
    if (path === image?.file.name) return;

    const { data } = supabase.storage.from("image_views").getPublicUrl(path);
    const file = await createFileBlobFromUrl(data.publicUrl);

    setImage({ url: data.publicUrl, file });
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <section className="h-full">
        <ResizablePanelGroup
          className="rounded-md border"
          direction="horizontal"
        >
          <ResizablePanel>
            <LocationForm
              image={image}
              setImage={setImage}
              activeLocation={activeLocation}
              setActiveLocation={setActiveLocation}
              pinMap={pinMap}
              setPinMap={setPinMap}
              cords={cords}
              setCords={setCords}
              setLocations={setLocations}
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
                pinMap={pinMap}
                setPinMap={setPinMap}
              >
                <>
                  {locations.map((location) => {
                    const { lat, lng } = location;
                    return (
                      <Marker
                        key={location.id}
                        position={{ lat, lng }}
                        eventHandlers={{
                          click: () => {
                            setActiveLocation(location);
                            setCords({ lat, lng });
                            getImageFile(location.image_path);
                          },
                        }}
                      />
                    );
                  })}
                </>
              </Map>
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
