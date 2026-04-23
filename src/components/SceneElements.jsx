import React from 'react';
import * as THREE from 'three';

import { useScroll } from '../context/ScrollContext';
import { useFrame } from '@react-three/fiber';

export function Lights() {
  const { progress } = useScroll();
  const ambientRef = React.useRef();
  const directRef = React.useRef();

  useFrame(() => {
    const s = progress.current;
    if (ambientRef.current) {
      // Fade ambient light from 1.2 to 0.05
      ambientRef.current.intensity = THREE.MathUtils.lerp(1.2, 0.05, s);
    }
    if (directRef.current) {
      // Fade directional sun light from 4 to 0 as we descend
      directRef.current.intensity = THREE.MathUtils.lerp(4, 0, s);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1.2} color="#051a33" />
      <directionalLight 
        ref={directRef}
        position={[10, 20, 10]} 
        intensity={4} 
        color="#aee6ff" 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      {/* Remove static point lights that might be too bright */}
      <pointLight position={[0, 8, 0]} intensity={2} color="#40aaff" distance={40} decay={1.5} />
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
