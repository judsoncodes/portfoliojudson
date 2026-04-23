import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky as DreiSky, Stars, Float } from '@react-three/drei';
import { useScroll } from '../context/ScrollContext';

const Boat = ({ position }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* Hull */}
        <mesh>
          <coneGeometry args={[1, 3, 4]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Cabin */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Lights */}
        <mesh position={[0, 0.8, 0.4]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ff4400" />
          <pointLight intensity={2} color="#ff4400" distance={5} />
        </mesh>
        <mesh position={[0, 0.8, -0.4]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#00ff44" />
          <pointLight intensity={2} color="#00ff44" distance={5} />
        </mesh>
      </group>
    </Float>
  );
};

const Sky = () => {
  const waterRef = useRef();
  const sunLightRef = useRef();
  const { progress } = useScroll();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = progress.current;
    
    if (waterRef.current) {
      waterRef.current.material.normalMap.offset.x = t * 0.02;
      waterRef.current.material.normalMap.offset.y = t * 0.02;
      // Surface becomes less visible as we go deep
      waterRef.current.material.opacity = THREE.MathUtils.lerp(0.9, 0.1, s);
    }

    if (sunLightRef.current) {
      // Sun light intensity drops as we descend
      sunLightRef.current.intensity = THREE.MathUtils.lerp(8000, 50, s);
    }
  });

  const normalMap = useMemo(() => {
    const tex = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg');
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  return (
    <>
      <Stars radius={150} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      {/* ☀️ CINEMATIC UNDERWATER SUN (Viewed from below) */}
      <group position={[0, 45, -50]}>
        {/* Core */}
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#fffbe6" toneMapped={false} />
        </mesh>
        {/* Glow */}
        <mesh scale={2.5}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color="#ffcc88" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
        <pointLight ref={sunLightRef} intensity={8000} distance={400} color="#ffcc88" decay={2} />
      </group>

      {/* 🌊 Surface Water Membrane */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshPhysicalMaterial 
          color="#001a33" 
          transparent 
          opacity={0.9} 
          roughness={0.02} 
          metalness={0.95}
          transmission={0.2}
          thickness={3}
          normalMap={normalMap}
          normalScale={[0.5, 0.5]}
        />
      </mesh>

      {/* Atmospheric Glow Layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.6, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Boats at the surface */}
      <Boat position={[-10, 0.5, 15]} />
      <Boat position={[15, 0.5, -5]} />
      <Boat position={[-20, 0.5, -30]} />
    </>
  );
};

export default Sky;
