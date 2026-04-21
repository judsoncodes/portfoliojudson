import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import disposalManager from '../utils/DisposalManager';
import { useScroll } from '../context/ScrollContext';
import useVisibility from '../hooks/useVisibility';

const ORGANISM_COUNT = 18; // 15 + 3 more as requested
const TENTACLES_PER_JELLY = 6;
const dummy = new THREE.Object3D();
const dummyCore = new THREE.Object3D();
const dummyTentacle = new THREE.Object3D();

/**
 * BioluminescentOrganisms
 * Realistic pulsing jellyfish with prominent trailing filaments.
 */
const BioluminescentOrganisms = () => {
  const { progress } = useScroll();
  const bellMeshRef = useRef();
  const coreMeshRef = useRef();
  const tentacleMeshRef = useRef();
  const sharedMaterialRef = useRef();
  const isVisible = useVisibility(bellMeshRef);
  const { invalidate } = useThree();

  // Initial state for organisms
  const organisms = useMemo(() => {
    return Array.from({ length: ORGANISM_COUNT }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 35 - 20
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      ),
      scale: 0.9 + Math.random() * 1.5,
      offset: Math.random() * Math.PI * 2,
      tentacles: Array.from({ length: TENTACLES_PER_JELLY }).map((_, i) => ({
        angle: (i / TENTACLES_PER_JELLY) * Math.PI * 2,
        phase: Math.random() * Math.PI,
        length: 2.0 + Math.random() * 2.5
      }))
    }));
  }, []);

  // GSAP Deep-Sea Color Palette
  useEffect(() => {
    if (!sharedMaterialRef.current) return;
    const colors = ['#00f5ff', '#a020f0', '#00ff88', '#ff00ff']; 
    let currentIndex = 0;
    const cycleColor = () => {
      currentIndex = (currentIndex + 1) % colors.length;
      gsap.to(sharedMaterialRef.current.emissive, {
        r: new THREE.Color(colors[currentIndex]).r,
        g: new THREE.Color(colors[currentIndex]).g,
        b: new THREE.Color(colors[currentIndex]).b,
        duration: 5,
        ease: 'power2.inOut',
        onComplete: cycleColor
      });
    };
    cycleColor();
    return () => gsap.killTweensOf(sharedMaterialRef.current.emissive);
  }, []);

  // Geometries
  const bellGeo = useMemo(() => disposalManager.track(new THREE.SphereGeometry(0.6, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.8)), []);
  const coreGeo = useMemo(() => disposalManager.track(new THREE.SphereGeometry(0.15, 16, 16)), []);
  const tentacleGeo = useMemo(() => disposalManager.track(new THREE.CylinderGeometry(0.015, 0.005, 1, 8)), []);

  useFrame((state) => {
    if (!isVisible || !bellMeshRef.current || progress.current < 0.6) return;

    const time = state.clock.getElapsedTime();
    const globalOpacity = THREE.MathUtils.clamp((progress.current - 0.6) * 10, 0, 1);

    organisms.forEach((org, i) => {
      // Pronounced Swimming (Fast contraction)
      const swimCycle = (time * 1.2 + org.offset) % (Math.PI * 2);
      const snap = Math.pow(Math.sin(swimCycle) * 0.5 + 0.5, 4);
      
      const swimScaleY = org.scale * (1.1 + snap * 0.4);
      const swimScaleXZ = org.scale * (1.0 - snap * 0.2);

      // Propulsion
      org.position.y += org.velocity.y + snap * 0.035;
      org.position.x += org.velocity.x + Math.sin(time * 0.2 + org.offset) * 0.002;
      org.position.z += org.velocity.z;

      // Wrap
      if (org.position.y > 30) org.position.y = -30;
      if (org.position.y < -30) org.position.y = 30;

      // Update Bell
      dummy.position.copy(org.position);
      dummy.scale.set(swimScaleXZ * globalOpacity, swimScaleY * globalOpacity, swimScaleXZ * globalOpacity);
      dummy.rotation.x = Math.sin(time * 0.1 + org.offset) * 0.2;
      dummy.rotation.z = Math.cos(time * 0.1 + org.offset) * 0.2;
      dummy.updateMatrix();
      bellMeshRef.current.setMatrixAt(i, dummy.matrix);

      // Update Core
      const flicker = 1.0 + (Math.random() - 0.5) * 0.2;
      dummyCore.position.copy(org.position).add(new THREE.Vector3(0, 0.1, 0).applyEuler(dummy.rotation));
      dummyCore.scale.setScalar((1 + snap * 0.5) * flicker * globalOpacity);
      dummyCore.updateMatrix();
      coreMeshRef.current.setMatrixAt(i, dummyCore.matrix);

      // Update Tentacles
      org.tentacles.forEach((tent, tIdx) => {
        const idx = i * TENTACLES_PER_JELLY + tIdx;
        const tPos = new THREE.Vector3(
          Math.cos(tent.angle) * 0.4 * swimScaleXZ,
          -0.1,
          Math.sin(tent.angle) * 0.4 * swimScaleXZ
        ).applyEuler(dummy.rotation);
        
        dummyTentacle.position.copy(org.position).add(tPos);
        
        // Trailing physics + Wobble
        const wobble = Math.sin(time * 3 + tent.phase + i) * 0.08;
        const drag = snap * 0.6; 
        
        dummyTentacle.rotation.set(dummy.rotation.x + drag + wobble, 0, dummy.rotation.z + wobble);
        dummyTentacle.scale.set(globalOpacity, tent.length * (1 - snap * 0.2) * globalOpacity, globalOpacity);
        dummyTentacle.updateMatrix();
        tentacleMeshRef.current.setMatrixAt(idx, dummyTentacle.matrix);
      });
    });

    bellMeshRef.current.instanceMatrix.needsUpdate = true;
    coreMeshRef.current.instanceMatrix.needsUpdate = true;
    tentacleMeshRef.current.instanceMatrix.needsUpdate = true;
    
    if (sharedMaterialRef.current) {
      sharedMaterialRef.current.emissiveIntensity = (Math.sin(time * 2) * 0.5 + 0.5) * 15 + 10;
      sharedMaterialRef.current.opacity = globalOpacity * 0.6;
    }
    invalidate();
  });

  useEffect(() => {
    return () => {
      bellGeo.dispose();
      coreGeo.dispose();
      tentacleGeo.dispose();
      if (sharedMaterialRef.current) sharedMaterialRef.current.dispose();
    };
  }, [bellGeo, coreGeo, tentacleGeo]);

  return (
    <group>
      <instancedMesh ref={bellMeshRef} args={[bellGeo, null, ORGANISM_COUNT]} frustumCulled={true}>
        <meshPhysicalMaterial
          ref={sharedMaterialRef}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          transmission={0.8}
          thickness={1.0}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      <instancedMesh ref={coreMeshRef} args={[coreGeo, null, ORGANISM_COUNT]} frustumCulled={true}>
        <meshStandardMaterial
          transparent
          emissiveIntensity={30}
          blending={THREE.AdditiveBlending}
        >
          <primitive object={sharedMaterialRef.current?.emissive || new THREE.Color()} attach="emissive" />
        </meshStandardMaterial>
      </instancedMesh>

      <instancedMesh ref={tentacleMeshRef} args={[tentacleGeo, null, ORGANISM_COUNT * TENTACLES_PER_JELLY]} frustumCulled={true}>
        <meshStandardMaterial
          transparent
          opacity={0.7}
          emissiveIntensity={20}
          blending={THREE.AdditiveBlending}
        >
          <primitive object={sharedMaterialRef.current?.emissive || new THREE.Color()} attach="emissive" />
        </meshStandardMaterial>
      </instancedMesh>
    </group>
  );
};

export default BioluminescentOrganisms;
