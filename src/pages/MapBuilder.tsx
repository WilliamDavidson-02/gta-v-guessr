import { LocationForm } from "@/components/LocationForm";
import Map, { LocationMarker } from "@/components/Map";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { createFileBlobFromUrl } from "@/lib/utils";
import supabase from "@/supabase/supabaseConfig";
import { Suspense, useEffect, useState } from "react";
import { Marker } from "react-leaflet";
import { toast } from "sonner";
import { GeoJSON } from "react-leaflet/GeoJSON";
import seg from "@/lib/seg.json";
import { FeatureCollection } from "geojson";

const regions = seg as FeatureCollection;

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
  const [activeLocation, setActiveLocation] = useState<LocationType | null>(
    null,
  );
  const [showGeoAreas, setShowGeoAreas] = useState(true);

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
              <div className="relative h-full w-full">
                <div className="absolute right-3 top-3 z-20 flex items-center justify-center gap-4 rounded-md border border-border bg-background p-2">
                  <Label htmlFor="show-areas">Toggle regions</Label>
                  <Switch
                    id="show-areas"
                    defaultChecked={showGeoAreas}
                    onCheckedChange={(check) => setShowGeoAreas(check)}
                  />
                </div>
                <Map onResize={mapResize}>
                  <>
                    <LocationMarker cords={cords} setCords={setCords} />
                    <GeoJSON
                      data={regions}
                      style={(feature) => {
                        if (!showGeoAreas) {
                          return { opacity: 0, fillOpacity: 0 };
                        }
                        return {
                          weight: 2,
                          color: feature?.properties.color,
                          fillColor: feature?.properties.fillColor,
                          opacity: 1,
                          fillOpacity: 0.5,
                        };
                      }}
                    />
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
              </div>
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
