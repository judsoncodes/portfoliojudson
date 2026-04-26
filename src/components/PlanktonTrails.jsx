import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import { getInterpolatedZone } from '../utils/depthZones';

export default function PlanktonTrails() {
  const { camera, pointer } = useThree();
  const { progress } = useScroll();
  const count = 3000; // Increased for a finer mist
  
  const pointsRef = useRef();
  const indexRef = useRef(0);
  const lastSpawnRef = useRef(new THREE.Vector3());
  const isFirstFrame = useRef(true);
  
  // Data arrays
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const lifetimes = useMemo(() => new Float32Array(count), [count]);
  const velocities = useMemo(() => new Float32Array(count * 3), [count]);
  const phases = useMemo(() => {
    const p = new Float32Array(count);
    for(let i=0; i<count; i++) p[i] = Math.random() * Math.PI * 2;
    return p;
  }, [count]);
  
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#00ffcc') }, 
    uTime: { value: 0 }
  }), []);

  const vec3 = new THREE.Vector3();
  const mouseVel = new THREE.Vector3();

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    const s = progress.current ?? 0;
    const zone = getInterpolatedZone(s);
    uniforms.uColor.value.set(zone.accent);

    // Project pointer into 3D space
    vec3.set(pointer.x, pointer.y, 0.5);
    vec3.unproject(camera);
    vec3.sub(camera.position).normalize();
    const distance = 10; 
    const spawnPoint = camera.position.clone().add(vec3.multiplyScalar(distance));

    if (isFirstFrame.current) {
      lastSpawnRef.current.copy(spawnPoint);
      isFirstFrame.current = false;
    }

    // Calculate how much the mouse moved (disturbance)
    const dist = spawnPoint.distanceTo(lastSpawnRef.current);
    
    // Only spawn when water is "disturbed" by movement
    if (dist > 0.02) {
      mouseVel.copy(spawnPoint).sub(lastSpawnRef.current).multiplyScalar(1 / delta);
      
      // Spawn amount proportional to distance moved (continuous fluid trail)
      const spawnCount = Math.min(Math.floor(dist * 50), 60);
      
      for (let i = 0; i < spawnCount; i++) {
          const idx = indexRef.current;
          
          // Interpolate along the drag line so the trail isn't dotted
          const lerpFactor = Math.random();
          const pX = THREE.MathUtils.lerp(lastSpawnRef.current.x, spawnPoint.x, lerpFactor);
          const pY = THREE.MathUtils.lerp(lastSpawnRef.current.y, spawnPoint.y, lerpFactor);
          const pZ = THREE.MathUtils.lerp(lastSpawnRef.current.z, spawnPoint.z, lerpFactor);
          
          // Organic fluid spread (smaller radius for microscopic look)
          const radius = 0.3;
          positions[idx * 3] = pX + (Math.random() - 0.5) * radius;
          positions[idx * 3 + 1] = pY + (Math.random() - 0.5) * radius;
          positions[idx * 3 + 2] = pZ + (Math.random() - 0.5) * radius;
          
          // Particles get swept in the wake of the mouse, plus random turbulence
          velocities[idx * 3] = mouseVel.x * 0.05 + (Math.random() - 0.5) * 0.4;
          velocities[idx * 3 + 1] = mouseVel.y * 0.05 + (Math.random() - 0.5) * 0.4 + 0.1; // Slight natural buoyancy
          velocities[idx * 3 + 2] = mouseVel.z * 0.05 + (Math.random() - 0.5) * 0.4;
          
          lifetimes[idx] = 1.0; 
          indexRef.current = (idx + 1) % count;
      }
      lastSpawnRef.current.copy(spawnPoint);
    }

    let needsUpdate = false;
    for (let i = 0; i < count; i++) {
      if (lifetimes[i] > 0) {
        lifetimes[i] -= delta * 0.35; // Slow, organic fade
        if (lifetimes[i] < 0) lifetimes[i] = 0;
        
        // Add a tiny bit of sine-wave drift to the physics for underwater feel
        positions[i*3] += (velocities[i*3] + Math.sin(state.clock.getElapsedTime() + phases[i]) * 0.05) * delta;
        positions[i*3+1] += velocities[i*3+1] * delta;
        positions[i*3+2] += (velocities[i*3+2] + Math.cos(state.clock.getElapsedTime() + phases[i]) * 0.05) * delta;
        
        needsUpdate = true;
      }
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
          varying float vPulse;
          void main() {
            vLife = aLife;
            // Pulse opacity and size organically
            vPulse = (sin(uTime * 3.0 + aPhase) * 0.5 + 0.5);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Much smaller, microscopic size
            float baseSize = 8.0 + (vPulse * 4.0);
            gl_PointSize = (baseSize * aLife) * (10.0 / -mvPosition.z);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vLife;
          varying float vPulse;
          void main() {
            if (vLife <= 0.0) discard;
            
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = length(cxy);
            
            // Exponential falloff for a soft, gaseous/organic glow instead of a hard circle
            float alpha = exp(-r * 3.5) * vLife * (0.5 + vPulse * 0.5);
            
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </points>
  );
}
