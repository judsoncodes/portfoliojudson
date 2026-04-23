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
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;

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

    float getElevation(vec2 p) {
      float dunes = noise(p * 0.4) * 0.3;
      float ripples = noise(p * 2.0 + uTime * 0.1) * 0.1;
      float sand = noise(p * 5.0) * 0.03;
      return dunes + ripples + sand;
    }

    void main() {
      vUv = uv;
      vec3 newPosition = position;

      float elevation = getElevation(newPosition.xy);
      newPosition.z += elevation;
      vElevation = elevation;

      // Compute normals for realistic lighting
      float e = 0.05;
      float xElev = getElevation(newPosition.xy + vec2(e, 0.0));
      float yElev = getElevation(newPosition.xy + vec2(0.0, e));
      
      vec3 v0 = newPosition;
      vec3 v1 = vec3(newPosition.x + e, newPosition.y, xElev);
      vec3 v2 = vec3(newPosition.x, newPosition.y + e, yElev);
      
      vNormal = normalize(cross(v1 - v0, v2 - v0));

      vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uScrollProgress;

    void main() {
      // Natural, clean sand colors
      vec3 ridgeColor = vec3(0.7, 0.6, 0.45); 
      vec3 valleyColor = vec3(0.4, 0.35, 0.25); 
      
      float mixFactor = smoothstep(-0.1, 0.3, vElevation);
      vec3 baseColor = mix(valleyColor, ridgeColor, mixFactor);

      // Subtle grain for texture without noise
      float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      baseColor += (grain - 0.5) * 0.02;

      // Clean, bright lighting
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.4));
      float diffuse = max(dot(normal, lightDir), 0.3); // Brighter ambient
      
      vec3 color = baseColor * diffuse;

      // Soft caustic shimmer
      float caustic = sin(vUv.x * 8.0 + uTime * 0.5) * cos(vUv.y * 8.0 + uTime * 0.4) * 0.02 + 0.02;
      color += vec3(caustic * 0.5, caustic * 0.6, caustic * 0.7);

      // Distant underwater clarity
      float depth = length(vViewPosition);
      float fog = smoothstep(20.0, 60.0, depth);
      color = mix(color, vec3(0.01, 0.05, 0.1), fog);

      // Smooth visibility reveal
      float alpha = smoothstep(0.3, 0.85, uScrollProgress);
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
