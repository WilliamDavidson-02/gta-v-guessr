import Map from "@/components/Map";

export default function MapBuilder() {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <section className="h-full">
        <Map className="rounded-md border p-2" />
      </section>
    </div>
  );
}
