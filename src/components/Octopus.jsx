import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

const OctopusInstance = ({ initialPos }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const tentaclesRefs = useRef([]);
  
  // Create stable initial positions for tentacles
  const tentaclesData = useMemo(() => {
    return Array.from({ length: 8 }).map((_, tIdx) => {
      const angle = (tIdx / 8) * Math.PI * 2;
      return {
        points: Array.from({ length: 12 }).map((_, pIdx) => ({
          position: new THREE.Vector3(
            Math.cos(angle) * pIdx * 0.2, 
            -0.15 * pIdx, 
            Math.sin(angle) * pIdx * 0.2
          ),
          velocity: new THREE.Vector3(0, 0, 0)
        }))
      };
    });
  }, []);

  const octopusMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({ 
      color: '#ff4d4d', 
      roughness: 0.3,
      metalness: 0.2,
      emissive: '#440000',
      emissiveIntensity: 0.5
    });
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    gsap.to(groupRef.current.position, {
      x: groupRef.current.position.x + (Math.random() - 0.5) * 6,
      y: groupRef.current.position.y + 4,
      z: groupRef.current.position.z + (Math.random() - 0.5) * 6,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(groupRef.current.position, {
          y: -11.9,
          duration: 1.5,
          ease: 'bounce.out'
        });
      }
    });
    // Visual flash
    gsap.to(octopusMat.color, { r: 1, g: 1, b: 1, duration: 0.1, yoyo: true, repeat: 1 });
    gsap.to(octopusMat.color, { r: 1.0, g: 0.2, b: 0.5, duration: 2.0 });
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) headRef.current.position.y = Math.sin(t * 1.0) * 0.1;

    tentaclesData.forEach((tentacle, tIdx) => {
      const tPoints = tentacle.points;
      const angle = (tIdx / 8) * Math.PI * 2;
      
      // Fixed base point relative to head
      tPoints[0].position.set(0, -0.2, 0);

      for (let i = 1; i < tPoints.length; i++) {
        const p = tPoints[i];
        const prev = tPoints[i - 1];

        // 1. Spring Force (Maintain length)
        const diff = p.position.clone().sub(prev.position);
        const dist = diff.length();
        const targetDist = 0.25;
        const force = diff.normalize().multiplyScalar((targetDist - dist) * 0.5);
        
        // 2. Swirl/Life animation
        const life = new THREE.Vector3(
          Math.sin(t * 1.5 + tIdx + i * 0.5) * 0.01,
          Math.cos(t * 1.2 + tIdx + i * 0.3) * 0.01,
          Math.sin(t * 0.8 + i) * 0.01
        );

        p.velocity.add(force).add(life);
        
        // 3. Keep spread out (Away from center)
        const spread = new THREE.Vector3(Math.cos(angle), -0.2, Math.sin(angle)).multiplyScalar(0.02);
        p.velocity.add(spread);

        p.velocity.multiplyScalar(0.9); // Damping
        p.position.add(p.velocity);

        // Hard constraint to prevent glitching
        const d = p.position.distanceTo(prev.position);
        if (d > 0.4) {
          p.position.copy(prev.position).add(p.position.clone().sub(prev.position).normalize().multiplyScalar(0.4));
        }
      }

      // Rebuild geometry safely
      try {
        const curve = new THREE.CatmullRomCurve3(tPoints.map(p => p.position));
        if (tentaclesRefs.current[tIdx]) {
          const oldGeo = tentaclesRefs.current[tIdx].geometry;
          tentaclesRefs.current[tIdx].geometry = new THREE.TubeGeometry(curve, 12, 0.06 - (tIdx*0.002), 6, false);
          if (oldGeo) oldGeo.dispose();
        }
      } catch (e) {
        console.error("Tentacle geometry failed", e);
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPos} onClick={handleClick}>
      <group ref={headRef}>
        {/* Bigger, more visible head */}
        <mesh scale={[1.2, 1.4, 1.2]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <primitive object={octopusMat} attach="material" />
        </mesh>
        <mesh position={[0.2, 0.2, 0.45]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="black" /></mesh>
        <mesh position={[-0.2, 0.2, 0.45]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="black" /></mesh>
      </group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} ref={el => tentaclesRefs.current[i] = el} material={octopusMat} />
      ))}
    </group>
  );
};

const Octopus = () => {
  return (
    <group name="OctopusGroup">
      <group scale={2.5}>
        <OctopusInstance initialPos={[0, -11.9, -2.5]} />
      </group>
    </group>
  );
};

export default Octopus;
