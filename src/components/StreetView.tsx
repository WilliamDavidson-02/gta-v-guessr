import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const CameraController = () => {
  const { camera, gl } = useThree();
  const [controls, setControls] = useState<OrbitControls | null>(null);

  useEffect(() => {
    if (camera && gl.domElement) {
      const newControls = new OrbitControls(camera, gl.domElement);
      newControls.enableDamping = true;
      newControls.enablePan = false;
      newControls.rotateSpeed = 0.6;
      newControls.dampingFactor = 0.3;
      setControls(newControls);

      return () => {
        newControls.dispose();
      };
    }
  }, [camera, gl]);

  useFrame(() => {
    if (controls) {
      controls.update();
    }
  });

  return null;
};

export default function StreetView() {
  const texture = useLoader(TextureLoader, "/360_1.jpg");

  return (
    <Canvas>
      <CameraController />
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial map={texture} side={1} />
      </mesh>
    </Canvas>
  );
}
