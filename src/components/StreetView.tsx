import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { OrbitControls } from "@react-three/drei";
import { Image } from "lucide-react";

type StreetViewProps = {
  url: string;
};

export default function StreetView({ url }: StreetViewProps) {
  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-secondary">
          <Image size={64} strokeWidth={1.3} />
          <p className="select-none text-clip text-nowrap">
            No panorama provided
          </p>
        </div>
      </div>
    );
  }

  const texture = useLoader(TextureLoader, url);

  return (
    <Canvas camera={{ fov: 80 }}>
      <OrbitControls rotateSpeed={0.6} dampingFactor={0.2} />
      {/* scale={[-1, 1, 1]}, inverts texture to get correct perspective */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial map={texture} side={1} />
      </mesh>
    </Canvas>
  );
}
