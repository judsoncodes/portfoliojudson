import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import disposalManager from '../utils/DisposalManager';
import useVisibility from '../hooks/useVisibility';

/**
 * Single Jellyfish Component
 * High-fidelity biological simulation with refractive materials and point lighting.
 */
const Jellyfish = ({ index, position, colors }) => {
  const groupRef = useRef();
  const bellRef = useRef();
  const undersideRef = useRef();
  const innerGlowRef = useRef();
  const tentaclesRef = useRef([]);

  // Geometries
  const bellGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    geo.scale(1, 0.65, 1); 
    return disposalManager.track(geo);
  }, []);

  const undersideGeo = useMemo(() => {
    const points = [
      new THREE.Vector2(0.38, 0),
      new THREE.Vector2(0.32, -0.08),
      new THREE.Vector2(0.22, -0.14),
      new THREE.Vector2(0.10, -0.16),
      new THREE.Vector2(0.0, -0.15)
    ];
    return disposalManager.track(new THREE.LatheGeometry(points, 32));
  }, []);

  const innerGlowGeo = useMemo(() => {
    return disposalManager.track(new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5));
  }, []);

  // Tentacles
  const TENTACLE_COUNT = 16;
  const tentaclesData = useMemo(() => {
    return Array.from({ length: TENTACLE_COUNT }).map((_, i) => {
      const angle = (i / TENTACLE_COUNT) * Math.PI * 2;
      const radius = 0.3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const length = 1.8 + Math.random() * 2.0;
      
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.random() * 0.2 - 0.1, -length * 0.3, Math.random() * 0.2 - 0.1),
        new THREE.Vector3(Math.random() * 0.4 - 0.2, -length * 0.6, Math.random() * 0.4 - 0.2),
        new THREE.Vector3(Math.random() * 0.6 - 0.3, -length, Math.random() * 0.6 - 0.3)
      ];
      
      const curve = new THREE.CatmullRomCurve3(points);
      return { curve, x, z };
    });
  }, []);

  // Materials
  const bellMat = useMemo(() => disposalManager.track(new THREE.MeshPhysicalMaterial({
    color: colors.bell,
    emissive: colors.glow,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.8,
    thickness: 1.0,
    side: THREE.DoubleSide
  })), [colors]);

  const undersideMat = useMemo(() => disposalManager.track(new THREE.MeshStandardMaterial({
    color: colors.bell,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  })), [colors]);

  const tentacleMat = useMemo(() => disposalManager.track(new THREE.MeshBasicMaterial({
    color: colors.glow,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })), [colors]);

  const glowMat = useMemo(() => disposalManager.track(new THREE.MeshBasicMaterial({
    color: colors.glow,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })), [colors]);

  const pointLightRef = useRef();
  const isVisible = useVisibility(groupRef);
  const { invalidate } = useThree();

  useFrame((state) => {
    if (!isVisible || !groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulseSpeed = 0.8 + index * 0.15;
    const pulse = Math.sin(t * pulseSpeed * Math.PI) * 0.5 + 0.5; 
    const contract = 1.0 - pulse * 0.3;

    bellRef.current.scale.set(1 + pulse * 0.1, contract, 1 + pulse * 0.1);
    undersideRef.current.scale.set(1 + pulse * 0.1, contract, 1 + pulse * 0.1);
    
    groupRef.current.position.y += (pulse > 0.5 ? 0.008 : -0.003);
    
    if (groupRef.current.position.y > position[1] + 3) groupRef.current.position.y = position[1] - 3;
    if (groupRef.current.position.y < position[1] - 3) groupRef.current.position.y = position[1] + 3;

    tentaclesRef.current.forEach((t_mesh, ti) => {
      if (t_mesh) {
        t_mesh.rotation.x = Math.sin(t * 1.2 + ti * 0.4) * 0.2;
        t_mesh.rotation.z = Math.cos(t * 0.9 + ti * 0.6) * 0.2;
      }
    });

    bellMat.emissiveIntensity = 0.8 + pulse * 1.2;
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 1.0 + pulse * 1.5;
    }
    invalidate();
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={bellRef} geometry={bellGeo} material={bellMat} />
      <mesh ref={undersideRef} geometry={undersideGeo} material={undersideMat} />
      <mesh ref={innerGlowRef} geometry={innerGlowGeo} material={glowMat} />

      {tentaclesData.map((t, i) => (
        <mesh 
          key={i} 
          position={[t.x, -0.05, t.z]} 
          ref={el => tentaclesRef.current[i] = el}
        >
          <tubeGeometry args={[t.curve, 20, 0.02, 8, false]} />
          <primitive object={tentacleMat} attach="material" />
        </mesh>
      ))}

      <pointLight
        ref={pointLightRef}
        color={colors.glow}
        intensity={2}
        distance={6}
        decay={2}
      />
    </group>
  );
};

export const JellyfishGroup = () => {
  const { progress } = useScroll();
  const groupRef = useRef();
  
  const colors = [
    { bell: 0x88ddff, glow: 0x00ffff },   
    { bell: 0xcc88ff, glow: 0xaa00ff },   
    { bell: 0xff88cc, glow: 0xff0088 },   
    { bell: 0x88ffcc, glow: 0x00ffaa },   
    { bell: 0xffcc44, glow: 0xff8800 },   
    { bell: 0x44ddff, glow: 0x0088ff },   
    { bell: 0xff44aa, glow: 0xff00ff },   
    { bell: 0x44ffaa, glow: 0x00ff88 },   
  ];

  const positions = [
    [-3.5, 1.5, -2],   
    [3.0, -1.0, -3],   
    [-1.0, 3.0, -1],   
    [2.5, 0.5, -1.5],  
    [0.0, -2.5, -4],   
    [-4.5, -3.0, -2.5],
    [4.0, 2.5, -3.5],
    [-2.0, -4.5, -2],
  ];

  useFrame(() => {
    if (!groupRef.current) return;
    const targetOpacity = THREE.MathUtils.clamp((progress.current - 0.3) * 5, 0, 1);
    groupRef.current.visible = targetOpacity > 0;
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <Jellyfish 
          key={i} 
          index={i} 
          position={pos} 
          colors={colors[i]} 
        />
      ))}
    </group>
  );
};

export default JellyfishGroup;
