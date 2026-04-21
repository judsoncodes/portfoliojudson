import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import oceanVert from '../shaders/ocean.vert';
import oceanFrag from '../shaders/ocean.frag';
import { useScroll } from '../context/ScrollContext';

const OceanBackground = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  const scrollProgress = useScroll();

  // Restore the flat PlaneGeometry for the "Beach/Floor" look
  const geometry = useMemo(() => {
    try {
      return new THREE.PlaneGeometry(100, 100, 128, 128);
    } catch (error) {
      console.error("Error creating Ocean geometry:", error);
      return new THREE.PlaneGeometry(10, 10, 16, 16);
    }
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDepthProgress: { value: 0 },
    uColorTop: { value: new THREE.Color('#00b4d8') },
    uColorBottom: { value: new THREE.Color('#03045e') }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Keep depth darkening logic
      materialRef.current.uniforms.uDepthProgress.value = scrollProgress.current ?? 0;
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
      position={[0, -5, 0]}
      geometry={geometry}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={oceanVert}
        fragmentShader={oceanFrag}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
};

export default OceanBackground;
