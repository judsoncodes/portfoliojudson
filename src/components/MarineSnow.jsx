import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MarineSnow = ({ count = 3000 }) => {
  const mesh = useRef();
  
  // Create particle positions and velocities
  const [positions, velocities, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const off = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      vel[i] = Math.random() * 0.02 + 0.01;
      off[i] = Math.random() * 100;
    }
    return [pos, vel, off];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const positionAttribute = mesh.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      // Move downward
      positionAttribute.array[i * 3 + 1] -= velocities[i];
      
      // Drift slightly left/right based on sine wave
      positionAttribute.array[i * 3] += Math.sin(time + offsets[i]) * 0.005;
      
      // Reset if out of bounds (Y wrap)
      if (positionAttribute.array[i * 3 + 1] < -30) {
        positionAttribute.array[i * 3 + 1] = 30;
      }
    }
    
    positionAttribute.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      if (mesh.current) {
        mesh.current.geometry.dispose();
        mesh.current.material.dispose();
      }
    };
  }, []);

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default MarineSnow;
