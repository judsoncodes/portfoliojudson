import React from 'react';

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} color="#1a4a7a" />
      <pointLight position={[0, 8, 0]} intensity={2.5} color="#40aaff" distance={30} decay={2} />
      <pointLight position={[0, -5, 0]} intensity={0.5} color="#003388" distance={20} decay={2} />
      <pointLight position={[5, 2, 5]} intensity={0.8} color="#0066cc" distance={15} decay={2} />
    </>
  );
}

import OceanBackground from './OceanBackground';
import FishMesh from './FishMesh';

export { OceanBackground };

export function MarineLayer({ depth, foodRef, counts }) {
  return (
    <>
      {/* Broken FishMesh removed, replaced by global FishSystem in SceneManager */}
    </>
  );
}

export function UILayer() {
  return null; 
}
