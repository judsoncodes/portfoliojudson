import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import disposalManager from '../utils/DisposalManager';

const buildLeg = (side, index) => {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: '#D32F2F', roughness: 0.6, metalness: 0.3, emissive: '#440000', emissiveIntensity: 0.6 });
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6), mat);
  upper.geometry.translate(0, -0.075, 0);
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 6), mat);
  lower.geometry.translate(0, -0.075, 0);
  lower.position.y = -0.15;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.005, 0.1, 6), mat);
  foot.geometry.translate(0, -0.05, 0);
  foot.position.y = -0.15;
  lower.add(foot); upper.add(lower); group.add(upper);
  return { group, upper, lower, foot };
};

const CrabInstance = ({ initialPos }) => {
  const groupRef = useRef();
  const legsRef = useRef([]);
  const clawsRef = useRef([]);
  const stateTimer = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    stateTimer.current += delta;
    groupRef.current.position.x += Math.sin(stateTimer.current * 0.3) * 0.005;
    legsRef.current.forEach((l, i) => {
      const side = i < 4 ? 1 : -1;
      const phase = t * 6.0 + (i % 4) * 0.8 + (i % 2 === 0 ? 0 : Math.PI);
      l.upper.rotation.z = Math.sin(phase) * 0.4 * side;
      l.lower.rotation.z = Math.sin(phase + 0.5) * 0.5 * side;
      l.foot.rotation.z = Math.sin(phase + 1.0) * 0.3 * side;
    });
  });

  return (
    <group ref={groupRef} position={initialPos}>
      <mesh scale={[1, 0.45, 0.75]}>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 12]} />
        <meshStandardMaterial color="#D32F2F" roughness={0.6} metalness={0.3} emissive="#440000" emissiveIntensity={0.6} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const side = i < 4 ? 1 : -1;
        const leg = buildLeg(side, i);
        return <primitive key={i} object={leg.group} position={[side * 0.2, 0, (i % 4) * 0.1 - 0.15]} rotation={[0, side * Math.PI / 2, 0]} ref={el => { if (el) legsRef.current[i] = leg; }} />;
      })}
    </group>
  );
};

const Crab = () => {
  return (
    <group name="CrabGroup">
      <group scale={4.0}>
        <CrabInstance initialPos={[-1.5, -11.9, -2.5]} />
      </group>
      <group scale={4.0}>
        <CrabInstance initialPos={[2.5, -11.9, -4.5]} />
      </group>
    </group>
  );
};

export default Crab;
