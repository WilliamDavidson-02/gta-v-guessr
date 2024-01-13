import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

type OnResize = number | null;

type MapProps = {
  className?: string;
  onResize?: OnResize;
};

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

function MapTileLayer({ onResize }: { onResize?: OnResize }) {
  const map = useMap();

  useEffect(() => {
    if (!onResize) return;
    map.invalidateSize();
  }, [onResize]);

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

export default function Map({ className = "", onResize }: MapProps) {
  return (
    <MapContainer
      className={className}
      zoom={1}
      minZoom={0}
      maxZoom={5}
      crs={CRS}
      scrollWheelZoom={true}
      bounds={bounds}
      style={{ height: "100%", width: "100%" }}
    >
      <MapTileLayer onResize={onResize} />
    </MapContainer>
  );
}
