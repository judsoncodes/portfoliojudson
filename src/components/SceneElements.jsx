import React from 'react';

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0066ff" />
    </>
  );
}

import OceanBackground from './OceanBackground';
export { OceanBackground };

export function MarineLayer({ depth }) {
  const colors = {
    bg: "#001d3d",
    mid: "#003566",
    fg: "#ffc300"
  };
  
  const zPositions = {
    bg: -10,
    mid: 0,
    fg: 10
  };

  return (
    <group position={[0, 0, zPositions[depth]]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors[depth]} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function UILayer() {
  return null; // For 3D UI elements if needed
}
