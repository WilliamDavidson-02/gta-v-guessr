import AdminLocationForm from "@/components/AdminLocationForm";
import Map from "@/components/Map";
import StreetView from "@/components/StreetView";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, useState } from "react";

export type LatLng = {
  lat: number;
  lng: number;
};

export default function MapBuilder() {
  const [mapResize, setMapResize] = useState(50); // range from 0 - 100
  const [cords, setCords] = useState<LatLng>({ lat: 0, lng: 0 });
  const [previewUrl, setPreviewUrl] = useState("");

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <section className="h-full">
        <ResizablePanelGroup
          className="rounded-md border"
          direction="horizontal"
        >
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel>
                <AdminLocationForm
                  setPreviewUrl={setPreviewUrl}
                  cords={cords}
                  setCords={setCords}
                />
              </ResizablePanel>
              <ResizableHandle className="border transition-colors duration-300 hover:border-white active:border-white" />
              <ResizablePanel defaultSize={70}>
                <Suspense
                  fallback={<Skeleton className="h-full w-full rounded-none" />}
                >
                  <StreetView url={previewUrl} />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle className="border transition-colors duration-300 hover:border-white active:border-white" />
          <ResizablePanel onResize={(size) => setMapResize(size)}>
            <Suspense
              fallback={<Skeleton className="h-full w-full rounded-none" />}
            >
              <Map cords={cords} setCords={setCords} onResize={mapResize} />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
