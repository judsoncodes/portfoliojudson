import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <OrbitControls />
    </>
  );
}

function App() {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute top-10 left-10 text-white pointer-events-none">
        <h1 className="text-4xl font-bold">Aquatic Portfolio</h1>
        <p className="text-lg opacity-80">R3F + GSAP + Framer Motion</p>
      </div>
    </div>
  );
}

export default App;
