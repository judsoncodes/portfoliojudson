import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarfishInstance = ({ position }) => {
  const groupRef = useRef();
  const armsRef = useRef([]);

  useFrame((state) => {
    armsRef.current.forEach((arm, i) => {
      if (arm) arm.rotation.z = Math.sin(state.clock.getElapsedTime() * 1.0 + i) * 0.1;
    });
  });

  const armGeo = useMemo(() => {
    const points = [new THREE.Vector2(0,0), new THREE.Vector2(0.2,0.05), new THREE.Vector2(0.5,0)];
    const geo = new THREE.LatheGeometry(points, 8);
    geo.rotateZ(-Math.PI/2);
    geo.translate(0.5, 0, 0);
    return geo;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      <mesh><cylinderGeometry args={[0.2, 0.2, 0.05, 16]} /><meshStandardMaterial color="#FF4500" emissive="#331100" emissiveIntensity={0.5} /></mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} ref={el => armsRef.current[i] = el} geometry={armGeo} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <meshStandardMaterial color="#FF4500" emissive="#331100" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const Starfish = () => {
  return (
    <group name="StarfishRoot">
      <group scale={5.0}>
        <StarfishInstance position={[-2.5, -11.9, -1.5]} />
      </group>
      <group scale={5.0}>
        <StarfishInstance position={[3.0, -11.9, -3.5]} />
      </group>
    </group>
  );
};

export default Starfish;
