import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createFlock } from '../utils/boids';

const MAX_FISH_COUNT = 100;
const BOUNDS = { x: 20, y: 15, z: 15 };

const FishMesh = () => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Create Flock
  const boids = useMemo(() => createFlock(MAX_FISH_COUNT, BOUNDS), []);

  // Procedural Geometry
  const geometry = useMemo(() => {
    // Body: Tapered cone
    const bodyGeo = new THREE.ConeGeometry(0.2, 1, 8);
    bodyGeo.rotateX(Math.PI / 2); // Point forward along Z
    
    // Tail: Two triangles
    const tailGeo1 = new THREE.ConeGeometry(0.15, 0.4, 3);
    tailGeo1.rotateZ(Math.PI);
    tailGeo1.translate(0, 0, -0.6);
    
    const tailGeo2 = tailGeo1.clone();
    tailGeo2.rotateZ(Math.PI / 2);

    // Dorsal fin
    const finGeo = new THREE.ConeGeometry(0.05, 0.3, 3);
    finGeo.translate(0, 0.15, 0.1);

    const merged = mergeGeometries([bodyGeo, tailGeo1, tailGeo2, finGeo]);
    return merged;
  }, []);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#22d3ee',
    emissive: '#083344',
    roughness: 0.3,
    metalness: 0.8,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();

    boids.forEach((boid, i) => {
      boid.update(boids, BOUNDS);
      
      dummy.position.copy(boid.position);
      
      // Orient dummy based on velocity
      if (boid.velocity.lengthSq() > 0.0001) {
        dummy.lookAt(
          boid.position.x + boid.velocity.x,
          boid.position.y + boid.velocity.y,
          boid.position.z + boid.velocity.z
        );
      }

      // Tail wiggle sine wave on Z rotation keyed to boid speed
      const speed = boid.velocity.length();
      const wiggle = Math.sin(time * 10 + i) * 0.2 * (speed / boid.maxSpeed);
      dummy.rotation.z += wiggle;

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_FISH_COUNT]}
      castShadow
      receiveShadow
    />
  );
};

export default FishMesh;
export { BOUNDS as FLOCK_BOUNDS };
