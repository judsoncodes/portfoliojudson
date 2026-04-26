import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import { getInterpolatedZone } from '../utils/depthZones';

const EnergyGeyser = ({ position }) => {
  const count = 1500;
  const pointsRef = useRef();
  
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const lifetimes = useMemo(() => new Float32Array(count), [count]);
  const phases = useMemo(() => new Float32Array(count), [count]);
  
  // Custom randoms for tornado swirl physics
  const angles = useMemo(() => new Float32Array(count), [count]);
  const speeds = useMemo(() => new Float32Array(count), [count]);

  useMemo(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];
      lifetimes[i] = Math.random(); 
      phases[i] = Math.random() * Math.PI * 2;
      angles[i] = Math.random() * Math.PI * 2;
      speeds[i] = 1.0 + Math.random() * 3.0;
    }
  }, [position, count]);

  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#39FF14') }, 
    uTime: { value: 0 }
  }), []);

  const { progress } = useScroll();

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    const zone = getInterpolatedZone(progress.current ?? 0);
    uniforms.uColor.value.set(zone.accent);

    let needsUpdate = false;
    for (let i = 0; i < count; i++) {
      lifetimes[i] -= delta * 0.25; // ~4 sec life
      if (lifetimes[i] <= 0) {
        lifetimes[i] = 1.0;
        angles[i] = Math.random() * Math.PI * 2;
        // Start tightly packed near the core
        const r = Math.random() * 0.3;
        positions[i * 3] = position[0] + Math.cos(angles[i]) * r;
        positions[i * 3 + 1] = position[1] - 0.5; // Start slightly inside the monolith tip
        positions[i * 3 + 2] = position[2] + Math.sin(angles[i]) * r;
      }
      
      const age = 1.0 - lifetimes[i];
      
      // Swirl outwards as it rises (plasma tornado effect)
      angles[i] += delta * 3.0; // Fast spin
      const radius = 0.2 + age * 4.0; // Expand aggressively
      
      positions[i * 3] = position[0] + Math.cos(angles[i]) * radius;
      positions[i * 3 + 1] += speeds[i] * delta * (1.0 + age * 2.0); // Accelerate upwards
      positions[i * 3 + 2] = position[2] + Math.sin(angles[i]) * radius;
      
      needsUpdate = true;
    }
    
    if (needsUpdate && pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.aLife.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-aLife" count={count} array={lifetimes} itemSize={1} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-aPhase" count={count} array={phases} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          attribute float aLife;
          attribute float aPhase;
          varying float vLife;
          void main() {
            vLife = aLife;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Rapid pulsing for a volatile energy look
            float pulse = sin(uTime * 10.0 + aPhase) * 0.5 + 0.5;
            float size = 15.0 + (pulse * 20.0);
            gl_PointSize = (size * aLife) * (10.0 / -mvPosition.z);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vLife;
          void main() {
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = length(cxy);
            float alpha = exp(-r * 4.0) * vLife;
            if (alpha < 0.01) discard;
            // Bright white core, colored edges
            vec3 finalColor = mix(uColor, vec3(1.0), (1.0 - r) * 0.8);
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </points>
  );
};

// Floating holographic data rings that scan the monoliths
const DataRing = ({ yPos, radius, speed }) => {
  const ref = useRef();
  const matRef = useRef();
  const { progress } = useScroll();

  useFrame((state) => {
    ref.current.rotation.z = state.clock.elapsedTime * speed;
    ref.current.position.y = yPos + Math.sin(state.clock.elapsedTime * 0.5 + yPos) * 0.5;
    
    const zone = getInterpolatedZone(progress.current ?? 0);
    if (matRef.current) matRef.current.color.set(zone.accent);
  });

  return (
    <mesh ref={ref} position={[0, yPos, 0]} rotation={[Math.PI/2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 4, 32]} />
      <meshBasicMaterial ref={matRef} transparent opacity={0.4} blending={THREE.AdditiveBlending}/>
    </mesh>
  );
};

const Monolith = ({ position, scale, height, rotation = [0,0,0] }) => {
   const { progress } = useScroll();
   const lightRef = useRef();
   const wireframeRef = useRef();

   useFrame((state) => {
     const zone = getInterpolatedZone(progress.current ?? 0);
     const color = new THREE.Color(zone.accent);
     if (lightRef.current) lightRef.current.color = color;
     if (wireframeRef.current) wireframeRef.current.color = color;
     
     // Thumping pulse for the light
     if (lightRef.current) {
        lightRef.current.intensity = 3.0 + Math.sin(state.clock.elapsedTime * 4.0) * 1.5;
     }
   });

   return (
      <group position={position} scale={scale} rotation={rotation}>
         {/* The Core Obsidian Hex-Pillar */}
         <mesh castShadow receiveShadow position={[0, height/2, 0]}>
            <cylinderGeometry args={[1, 1.5, height, 6]} />
            <meshStandardMaterial 
              color="#010203" 
              metalness={0.9} 
              roughness={0.1} 
            />
         </mesh>
         
         {/* Glowing Holographic Wireframe Shell */}
         <mesh position={[0, height/2, 0]}>
            <cylinderGeometry args={[1.05, 1.55, height, 6]} />
            <meshBasicMaterial 
              ref={wireframeRef}
              wireframe 
              transparent 
              opacity={0.15} 
              blending={THREE.AdditiveBlending}
            />
         </mesh>

         {/* Energy Core Tip */}
         <mesh position={[0, height, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 0.5, 6]} />
            <meshBasicMaterial color="#ffffff" />
         </mesh>
         
         {/* Dynamic Data Rings */}
         <DataRing yPos={height * 0.3} radius={2.2} speed={1} />
         <DataRing yPos={height * 0.6} radius={1.8} speed={-1.5} />
         <DataRing yPos={height * 0.85} radius={1.3} speed={2.5} />
         
         {/* Illuminating the surrounding area */}
         <pointLight ref={lightRef} position={[0, height + 1, 0]} distance={30} decay={2} />
      </group>
   );
};

export default function HydrothermalVents() {
  return (
    <group>
      {/* Monolith 1: Center background */}
      <group position={[0, -14, -30]}>
        <Monolith height={15} scale={1.5} rotation={[0.1, 0.5, -0.05]} />
        <EnergyGeyser position={[0, 15 * 1.5, 0]} />
      </group>

      {/* Monolith 2: Left */}
      <group position={[-18, -15, -20]}>
        <Monolith height={12} scale={1.2} rotation={[-0.05, 1, 0.1]} />
        <EnergyGeyser position={[0, 12 * 1.2, 0]} />
      </group>

      {/* Monolith 3: Right */}
      <group position={[22, -13, -25]}>
        <Monolith height={18} scale={1.8} rotation={[0.05, -0.5, -0.1]} />
        <EnergyGeyser position={[0, 18 * 1.8, 0]} />
      </group>
    </group>
  );
}
