import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useCursorWorld from '../hooks/useCursorWorld';

const MAX_FOOD_PARTICLES = 80;
const dummy = new THREE.Object3D();

const FoodSystem = ({ foodRef }) => {
  const meshRef = useRef();
  const { cursorWorld } = useCursorWorld();

  const spawnFood = (e) => {
    const count = 12;
    for (let i = 0; i < count; i++) {
      if (foodRef.current.length < MAX_FOOD_PARTICLES) {
        foodRef.current.push({
          position: cursorWorld.current.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5
          )),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.04,
            -0.08 - Math.random() * 0.1, // Sinking
            (Math.random() - 0.5) * 0.04
          ),
          rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
          rotVel: new THREE.Vector3(Math.random() * 0.15, Math.random() * 0.15, Math.random() * 0.15),
          lifetime: 10.0, // Last longer
          expired: false
        });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', spawnFood);
    return () => window.removeEventListener('mousedown', spawnFood);
  }, []);

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

        p.velocity.y -= 0.0015; 
        p.velocity.multiplyScalar(0.96); 
        p.position.add(p.velocity);
        
        p.rotation.x += p.rotVel.x;
        p.rotation.y += p.rotVel.y;
        
        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        
        // Dynamic scale - starts big, stays visible
        const scale = (p.lifetime / 10.0) * 0.6 + 0.2;
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
    color: '#fbbf24', // Amber-400
    emissive: '#f59e0b', // Amber-500
    emissiveIntensity: 5.0, // High intensity glow
    roughness: 0.2,
    metalness: 0.5
  }), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_FOOD_PARTICLES]}
    />
  );
};

export default FoodSystem;
