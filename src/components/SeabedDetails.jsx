import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';
import { useScroll } from '../context/ScrollContext';

const SeabedDetails = () => {
  const { progress } = useScroll();
  const groupRef = useRef();

  const stones = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 40;
      const scale = 0.05 + Math.random() * 0.25;
      const rotation = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI];
      arr.push({ x, z, scale, rotation });
    }
    return arr;
  }, []);

  const stoneGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1, 0);
    return disposalManager.track(geo);
  }, []);

  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a453e',
    roughness: 0.9,
    metalness: 0.1
  }), []);

  // Silt/Dust Particles near floor
  const dustCount = 400;
  const dustPos = useMemo(() => {
    const arr = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = Math.random() * 2.0; // Stay near floor
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const alpha = THREE.MathUtils.smoothstep(progress.current, 0.3, 0.8);
      groupRef.current.visible = alpha > 0.01;
      // We could animate dust here but keeping it static for perf
    }
  });

  return (
    <group ref={groupRef} position={[0, -12.1, 0]}>
      {/* Scattered Stones */}
      {stones.map((s, i) => (
        <mesh 
          key={i} 
          geometry={stoneGeo} 
          material={stoneMat} 
          position={[s.x, 0, s.z]} 
          scale={s.scale} 
          rotation={s.rotation}
        />
      ))}

      {/* Low-lying Abyssal Silt */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={dustPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#8b7355"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

export default SeabedDetails;
