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
import FishMesh from './FishMesh';

export { OceanBackground };

export function MarineLayer({ depth, foodRef }) {
  // Layer configurations as per instructions:
  // fg: 8 fast fish, mid: 15 medium, bg: 25 slow distant
  const configs = {
    fg: { count: 8, speed: 1.6, bounds: { x: 30, y: 20, z: 10 }, palette: ['#22d3ee', '#06b6d4'] },
    mid: { count: 15, speed: 1.0, bounds: { x: 40, y: 25, z: 15 }, palette: ['#0891b2', '#0e7490'] },
    bg: { count: 25, speed: 0.5, bounds: { x: 60, y: 35, z: 20 }, palette: ['#064e62', '#022c37'] }
  };

  const config = configs[depth] || configs.mid;

  return (
    <FishMesh 
      count={config.count} 
      speed={config.speed} 
      bounds={config.bounds} 
      palette={config.palette}
      foodRef={foodRef} 
    />
  );
}

export function UILayer() {
  return null; // For 3D UI elements if needed
}
