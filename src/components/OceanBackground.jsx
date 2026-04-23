import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';
import oceanVert from '../shaders/ocean.vert';
import oceanFrag from '../shaders/ocean.frag';
import { useScroll } from '../context/ScrollContext';
import { DEPTH_ZONES } from '../utils/depthZones';

const OceanBackground = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { invalidate } = useThree();
  const scrollProgress = useScroll();

  const geometry = useMemo(() => {
    return disposalManager.track(new THREE.SphereGeometry(100, 64, 64));
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDepthProgress: { value: 0 },
    uSunlitTop: { value: new THREE.Color(DEPTH_ZONES.SUNLIT.top) },
    uSunlitBottom: { value: new THREE.Color(DEPTH_ZONES.SUNLIT.bottom) },
    uTwilightTop: { value: new THREE.Color(DEPTH_ZONES.TWILIGHT.top) },
    uTwilightBottom: { value: new THREE.Color(DEPTH_ZONES.TWILIGHT.bottom) },
    uAbyssalTop: { value: new THREE.Color(DEPTH_ZONES.ABYSSAL.top) },
    uAbyssalBottom: { value: new THREE.Color(DEPTH_ZONES.ABYSSAL.bottom) }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uDepthProgress.value = scrollProgress.progress.current ?? 0;
    }
    invalidate();
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
      geometry={geometry}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={oceanVert}
        fragmentShader={oceanFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
      />
    </mesh>
  );
};

export default OceanBackground;
