import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';
import useVisibility from '../hooks/useVisibility';

const Caustics = () => {
  const meshRef = useRef();
  
  const material = useMemo(() => disposalManager.track(new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#22d3ee') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;

      void main() {
        vec2 p = vUv * 10.0;
        vec2 i = vec2(p);
        float c = 1.0;
        float inten = 0.05;

        for (int n = 0; n < 5; n++) {
          float t = uTime * (1.0 - (3.5 / float(n + 1)));
          i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
          c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
        }

        c /= 5.0;
        c = 1.17 - pow(c, 1.4);
        vec3 color = vec3(pow(abs(c), 8.0));
        color = clamp(color + uColor * 0.2, 0.0, 1.0);

        gl_FragColor = vec4(color, color.r * 0.3);
      }
    `
  })), []);

  const { invalidate } = useThree();
  const isVisible = useVisibility(meshRef);
  
  useFrame((state) => {
    if (!isVisible) return;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    invalidate();
  });

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]} 
      scale={100}
    >
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const LightShafts = () => {
  const count = 300;
  const geometryRef = useRef();
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const velocities = useMemo(() => new Float32Array(count), [count]);

  // Initial positions
  useMemo(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i] = 0.01 + Math.random() * 0.02;
    }
  }, [count, positions, velocities]);

  const { invalidate } = useThree();
  const pointsRef = useRef();
  const isVisible = useVisibility(pointsRef);

  useFrame((state) => {
    if (!isVisible || !geometryRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const attr = geometryRef.current.attributes.position;
    
    for (let i = 0; i < count; i++) {
      // Gentle swaying and downward drift
      const xIdx = i * 3;
      const yIdx = i * 3 + 1;
      
      // Update Y (falling/drifting)
      positions[yIdx] -= velocities[i];
      if (positions[yIdx] < -20) positions[yIdx] = 20;
      
      // Update X (swaying)
      positions[xIdx] += Math.sin(time + i) * 0.01;
      
      attr.array[xIdx] = positions[xIdx];
      attr.array[yIdx] = positions[yIdx];
    }
    
    attr.needsUpdate = true;
    invalidate();
  });

  useEffect(() => {
    return () => {
      if (geometryRef.current) geometryRef.current.dispose();
    };
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#22d3ee"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
};

const CausticsLayer = () => {
  return (
    <group name="CausticsLayer">
      <Caustics />
      <LightShafts />
    </group>
  );
};

export default CausticsLayer;
