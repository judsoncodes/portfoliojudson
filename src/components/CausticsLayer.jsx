import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';

/**
 * LEGENDARY CAUSTICS SHADER
 * High-fidelity light webbing with chromatic aberration and depth-aware intensity.
 */
const Caustics = () => {
  const meshRef = useRef();
  
  const material = useMemo(() => disposalManager.track(new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#22d3ee') },
      uBrightness: { value: 0.8 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uBrightness;

      // High-performance Voronoi for light webbing
      vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453123);
      }

      float voronoi(vec2 x, float time) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float m = 1.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash(n + g);
            o = 0.5 + 0.5 * sin(time + 6.2831 * o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < m) m = d;
          }
        }
        return sqrt(m);
      }

      void main() {
        vec2 uv = vUv * 15.0;
        float t = uTime * 0.8;
        
        // Dual-layer caustic interference
        float v1 = voronoi(uv + t * 0.1, t);
        float v2 = voronoi(uv * 1.5 - t * 0.15, t * 1.2);
        
        // Chromatic fringing (Legendary look)
        float r = pow(1.0 - min(v1, v2), 12.0);
        float g = pow(1.0 - min(v1 * 1.02, v2 * 0.98), 12.0);
        float b = pow(1.0 - min(v1 * 0.98, v2 * 1.02), 12.0);
        
        vec3 caustics = vec3(r, g, b) * uBrightness;
        
        // Atmospheric falloff
        float edgeFade = smoothstep(0.5, 0.0, length(vUv - 0.5));
        float depthFade = smoothstep(-20.0, 5.0, vWorldPosition.y);
        
        gl_FragColor = vec4(caustics * uColor, r * edgeFade * depthFade * 0.6);
      }
    `
  })), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]} 
      scale={120}
    >
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

/**
 * TEXTURED LIGHT SHAFTS (God Rays)
 * More volumetric and textured than basic points.
 */
const LightShafts = () => {
  const groupRef = useRef();
  const count = 12;
  
  const shafts = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        pos: [(Math.random() - 0.5) * 50, 10, (Math.random() - 0.5) * 50],
        rot: [Math.random() * 0.5, 0, Math.random() * 0.5],
        scale: [1 + Math.random() * 3, 40 + Math.random() * 20, 1],
        opacity: 0.05 + Math.random() * 0.1,
        speed: 0.1 + Math.random() * 0.2
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.y = t * shafts[i].speed * 0.1;
        child.position.x += Math.sin(t * 0.5 + i) * 0.01;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {shafts.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial 
            color="#22d3ee" 
            transparent 
            opacity={s.opacity} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

const CausticsLayer = () => {
  return (
    <group name="LegendaryCaustics">
      <Caustics />
      <LightShafts />
    </group>
  );
};

export default CausticsLayer;
