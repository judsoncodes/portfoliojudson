import React from 'react';

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} color="#1a4a7a" />
      <pointLight position={[0, 8, 0]} intensity={2.0} color="#40aaff" distance={25} decay={2} />
      <pointLight position={[2, -4, 4]} intensity={0.8} color="#0055aa" distance={18} decay={2} />
      <spotLight position={[0, 10, 0]} angle={0.6} intensity={1.5} color="#88ccff" penumbra={0.8} />
    </>
  );
}

import OceanBackground from './OceanBackground';
import FishMesh from './FishMesh';

export { OceanBackground };

export function MarineLayer({ depth, foodRef }) {
  // Enhanced population counts for "more swarms"
  const configs = {
    fg: { count: 12, speed: 1.6, bounds: { x: 30, y: 20, z: 10 }, palette: ['#22d3ee', '#06b6d4'] },
    mid: { count: 35, speed: 1.0, bounds: { x: 45, y: 30, z: 15 }, palette: ['#0891b2', '#0e7490'] },
    bg: { count: 60, speed: 0.6, bounds: { x: 65, y: 40, z: 25 }, palette: ['#064e62', '#022c37'] }
  };

  const config = configs[depth] || configs.mid;

  return (
    <>
      <FishMesh 
        count={config.count} 
        speed={config.speed} 
        bounds={config.bounds} 
        palette={config.palette}
        foodRef={foodRef} 
      />
      {/* Add secondary swarm for midground density */}
      {depth === 'mid' && (
        <FishMesh 
          count={20} 
          speed={1.4} 
          bounds={{ x: 50, y: 35, z: 20 }} 
          palette={['#10b981', '#059669', '#047857']}
          foodRef={foodRef} 
        />
      )}
      {/* Add secondary swarm for background density */}
      {depth === 'bg' && (
        <FishMesh 
          count={40} 
          speed={0.4} 
          bounds={{ x: 70, y: 45, z: 30 }} 
          palette={['#011e26', '#022c37']}
          foodRef={foodRef} 
        />
      )}
    </>
  );
}

export function UILayer() {
  return null; 
}
