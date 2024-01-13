import Map from "@/components/Map";
import StreetView from "@/components/StreetView";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";

export default function MapBuilder() {
  const [mapResize, setMapResize] = useState(50);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <section className="h-full">
        <ResizablePanelGroup
          className="rounded-md border"
          direction="horizontal"
        >
          <ResizablePanel>
            <StreetView />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel onResize={(size) => setMapResize(size)}>
            <Map onResize={mapResize} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
