import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';
import seabedVert from '../shaders/seabed.vert';
import seabedFrag from '../shaders/seabed.frag';
import { useScroll } from '../context/ScrollContext';

/**
 * Seabed Component
 * Procedural terrain at the bottom of the ocean.
 * Fades in as the user descends into the abyss.
 */
const Seabed = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { invalidate } = useThree();
  const scroll = useScroll();

  // PlaneGeometry(60, 60, 120, 120) as per Prompt 26
  const geometry = useMemo(() => {
    return disposalManager.track(new THREE.PlaneGeometry(60, 60, 120, 120));
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uScrollProgress.value = scroll.progress.current;
    }
    // We always invalidate here because the seabed might be moving or fading
    // and the frameloop is set to 'always' globally anyway, but this is good practice.
    invalidate();
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
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
        vertexShader={seabedVert}
        fragmentShader={seabedFrag}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default Seabed;
