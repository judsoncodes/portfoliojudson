import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';

const MAX_FOOD_PARTICLES = 80;
const dummy = new THREE.Object3D();

const FoodSystem = ({ foodRef }) => {
  const meshRef = useRef();
  
  // Handle feeding ONLY when clicking this specific interaction plane
  const handleFeed = (e) => {
    e.stopPropagation(); // Stop if we hit a UI element
    const point = e.point;
    
    const count = 10;
    for (let i = 0; i < count; i++) {
      if (foodRef.current.length < MAX_FOOD_PARTICLES) {
        foodRef.current.push({
          position: point.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          )),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.06,
            -0.08 - Math.random() * 0.1, 
            (Math.random() - 0.5) * 0.06
          ),
          rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
          rotVel: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1),
          lifetime: 8.0,
          expired: false
        });
      }
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const particles = foodRef.current;
    
    for (let i = 0; i < MAX_FOOD_PARTICLES; i++) {
      if (i < particles.length) {
        const p = particles[i];
        p.lifetime -= delta;
        
        if (p.lifetime <= 0 || p.expired) {
          particles.splice(i, 1);
          dummy.position.set(0, -1000, 0);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }

        p.velocity.y -= 0.002; 
        p.velocity.multiplyScalar(0.97); 
        p.position.add(p.velocity);
        
        dummy.position.copy(p.position);
        const scale = (p.lifetime / 8.0) * 0.5 + 0.1;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.position.set(0, -1000, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.18, 0), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ffcc',
    emissive: '#00ffcc',
    emissiveIntensity: 3,
  }), []);

  return (
    <>
      {/* BACKGROUND INTERACTION PLANE - Catches clicks to feed fish */}
      <mesh position={[0, 0, -5]} onClick={handleFeed}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <instancedMesh
        ref={meshRef}
        args={[geometry, material, MAX_FOOD_PARTICLES]}
        frustumCulled={false}
      />
    </>
  );
};

export default FoodSystem;
