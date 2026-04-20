import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MarineSnow = ({ count = 3000 }) => {
  const mesh = useRef();
  
  // Create particle positions and velocities
  const [positions, velocities, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const size = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Random position in a large box
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      // Falling velocity
      vel[i] = Math.random() * 0.05 + 0.01;
      
      // Random size
      size[i] = Math.random() * 0.15 + 0.05;
    }
    return [pos, vel, size];
  }, [count]);

  useFrame((state, delta) => {
    const positionAttribute = mesh.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      // Move downward
      positionAttribute.array[i * 3 + 1] -= velocities[i];
      
      // Drift slightly left/right based on sine wave
      positionAttribute.array[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.005;
      
      // Reset if out of bounds
      if (positionAttribute.array[i * 3 + 1] < -30) {
        positionAttribute.array[i * 3 + 1] = 30;
      }
    }
    
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default MarineSnow;
