import React, { useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import waveWashVert from '../shaders/waveWash.vert';
import waveWashFrag from '../shaders/waveWash.frag';

const WaveWash = ({ onComplete }) => {
  const { viewport } = useThree();
  const materialRef = useRef();
  const meshRef = useRef();

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color('#22d3ee') } // Cyan-400
  }), []);

  useEffect(() => {
    const tl = gsap.to(uniforms.uProgress, {
      value: 1,
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    return () => {
      tl.kill();
      // Memory cleanup as requested
      if (meshRef.current) {
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        if (meshRef.current.material) meshRef.current.material.dispose();
      }
    };
  }, [onComplete, uniforms.uProgress]);

  return (
    <mesh 
      ref={meshRef}
      position={[0, 0, 10]} // In front of everything
    >
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waveWashVert}
        fragmentShader={waveWashFrag}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthTest={false}
      />
    </mesh>
  );
};

export default WaveWash;
