import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';

/**
 * SeaFloor Component
 * High-fidelity procedural seabed terrain with layered noise displacement.
 * Created from scratch as per Prompt 26 requirements.
 */
const SeaFloor = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  const scroll = useScroll();

  useEffect(() => {
    console.log('SeaFloor mounted at y=-12');
  }, []);

  const geometry = useMemo(() => new THREE.PlaneGeometry(60, 60, 120, 120), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 }
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform float uScrollProgress;

    float hash(vec2 p) { 
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); 
    }

    float noise(vec2 p) {
      vec2 i = floor(p); 
      vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      vUv = uv;
      vec3 newPosition = position;

      // Layer 1 — large dunes
      // Using xy since PlaneGeometry is generated in the XY plane
      float dunes = noise(newPosition.xy * 0.15) * 1.8;
      
      // Layer 2 — medium ripples
      float ripples = noise(newPosition.xy * 0.8 + uTime * 0.05) * 0.3;
      
      // Layer 3 — fine sand detail
      float sand = noise(newPosition.xy * 3.0) * 0.08;

      // Displace Z for height (which becomes Y in world space after rotation)
      float elevation = dunes + ripples + sand;
      newPosition.z += elevation;
      vElevation = elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform float uScrollProgress;

    void main() {
      // Blend colors based on displaced height
      vec3 ridgeColor = vec3(0.784, 0.663, 0.431); // #c8a96e
      vec3 valleyColor = vec3(0.541, 0.416, 0.227); // #8a6a3a
      
      float mixFactor = smoothstep(-1.0, 1.5, vElevation);
      vec3 color = mix(valleyColor, ridgeColor, mixFactor);

      // Caustic shimmer
      float caustic = sin(vUv.x * 12.0 + uTime) * cos(vUv.y * 12.0 + uTime * 0.7) * 0.06 + 0.06;
      color += vec3(caustic * 0.4, caustic * 0.6, caustic);

      // Fade in as user descends
      float alpha = smoothstep(0.65, 0.80, uScrollProgress);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uScrollProgress.value = scroll.progress.current;
    }
  });

  useEffect(() => {
    return () => {
      if (geometry) geometry.dispose();
      if (materialRef.current) materialRef.current.dispose();
    };
  }, [geometry]);

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -12, 0]}
      geometry={geometry}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default SeaFloor;
