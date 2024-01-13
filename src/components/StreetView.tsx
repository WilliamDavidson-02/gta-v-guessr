import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { OrbitControls } from "@react-three/drei";

export default function StreetView() {
  const texture = useLoader(TextureLoader, "/360_1.jpg");

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
