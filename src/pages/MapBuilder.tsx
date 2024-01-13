import Map from "@/components/Map";
import StreetView from "@/components/StreetView";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function MapBuilder() {
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
          <ResizablePanel>
            <Map />
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
