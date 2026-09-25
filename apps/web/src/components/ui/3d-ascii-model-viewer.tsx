import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  AsciiRenderer,
  useGLTF,
  Environment,
} from "@react-three/drei";

interface ModelProps {
  scale: number;
  rotation: [number, number, number];
  modelUrl: string;
  position: [number, number, number];
}

function Model({ scale, rotation, modelUrl, position }: ModelProps) {
  const { scene } = useGLTF(modelUrl);

  return (
    <primitive
      object={scene}
      scale={scale}
      rotation={rotation}
      position={position}
    />
  );
}

export interface AsciiModelViewerProps {
  modelUrl?: string;
  baseScale?: number;
  position?: [number, number, number];
  resolution?: number;
  characters?: string;
  userScale?: number;
  fgColor?: string;
  bgColor?: string;
  invert?: boolean;
}

export default function AsciiModelViewer({
  modelUrl = "https://danielcodepen.s3.us-east-1.amazonaws.com/figma.fbx.glb",
  baseScale = 0.8,
  position = [0, -0.2, 0],
  resolution = 0.22,
  characters = " .:-=+*#%@",
  userScale = 1,
  fgColor = "#ffffff",
  bgColor = "#007BE5",
  invert = false,
}: AsciiModelViewerProps) {
  const finalScale = baseScale * userScale;

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: [0, 0, 3],
          fov: 50,
        }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          <Model
            key={modelUrl}
            scale={finalScale}
            rotation={[0, 0, 0]}
            modelUrl={modelUrl}
            position={position}
          />
          <Environment preset="studio" />
        </Suspense>

        <Suspense fallback={null}>
          <AsciiRenderer
            key={`${resolution}-${characters}-${fgColor}-${bgColor}-${invert}`}
            resolution={resolution}
            characters={characters}
            fgColor={fgColor}
            bgColor={bgColor}
            invert={invert}
          />
        </Suspense>

        <OrbitControls
          autoRotate={true}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}
