import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dispatch, SetStateAction, useEffect } from "react";
import { LatLng, LocationType } from "@/pages/MapBuilder";
import { cn } from "@/lib/utils";

type OnResize = number | null;

export type Cords = {
  cords: LatLng;
  setCords: Dispatch<SetStateAction<LatLng>>;
};

type PinMap = {
  pinMap: boolean;
  setPinMap: Dispatch<SetStateAction<boolean>>;
};

type MapProps = Cords &
  PinMap & {
    className?: string;
    onResize?: OnResize;
    locations: LocationType[];
  };

type LocationMarkerProps = Cords & PinMap;

const mapExtent = [0, -8192, 8192, 0];
const bounds: [number, number][] = [
  [mapExtent[3], mapExtent[2]],
  [mapExtent[1], mapExtent[0]],
];

const tileExtent = [0, -8192, 8192, 0];
const minResolution = Math.pow(2, 5 + 1) * 0.25;

const CRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, -tileExtent[0], -1, tileExtent[3]),
  scale: (zoom: number) => {
    return Math.pow(2, zoom) / minResolution;
  },
  zoom: (scale: number) => {
    return Math.log(scale * minResolution) / Math.LN2;
  },
});

function DisplayLocationMarkers({ locations }: { locations: LocationType[] }) {
  return locations.map((location) => {
    const { lat, lng } = location;
    return (
      <Marker
        key={location.id}
        position={{ lat, lng }}
        eventHandlers={{
          click: () => console.log(location),
        }}
      />
    );
  });
}

function LocationMarker({
  cords,
  setCords,
  pinMap,
  setPinMap,
}: LocationMarkerProps) {
  useMapEvents({
    click(ev) {
      if (!pinMap) return;
      const { lat, lng } = ev.latlng;

      setPinMap(false);
      setCords({ lat, lng });
    },
  });

  if (!cords.lat && !cords.lng) return null;

  return <Marker position={cords} />;
}

function MapTileLayer({ onResize }: { onResize?: OnResize }) {
  const map = useMap();

  useEffect(() => {
    if (!onResize) return;
    map.invalidateSize();
  }, [onResize, map]);

  return (
    <TileLayer
      url="/satellite/{z}/{x}/{y}.png"
      tileSize={512}
      attribution=""
      tms={!0}
      noWrap={!0}
    />
  );
}

export default function Map({
  className = "",
  onResize,
  cords,
  setCords,
  locations,
  pinMap,
  setPinMap,
}: MapProps) {
  return (
    <MapContainer
      className={cn(className)}
      minZoom={0}
      maxZoom={5}
      crs={CRS}
      bounds={bounds}
      style={{ height: "100%", width: "100%" }}
    >
      <MapTileLayer onResize={onResize} />
      <LocationMarker
        cords={cords}
        setCords={setCords}
        pinMap={pinMap}
        setPinMap={setPinMap}
      />
      <DisplayLocationMarkers locations={locations} />
    </MapContainer>
  );
}
