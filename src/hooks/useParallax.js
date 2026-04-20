import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * useParallax Hook
 * Tracks mouse position normalized to [-1, 1] and provides a lerped value
 * for smooth parallax effects.
 */
const useParallax = () => {
  const mouse = useRef({ x: 0, y: 0 });
  const parallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      // Normalize mouse to [-1, 1]
      // x: -1 (left) to 1 (right)
      // y: -1 (bottom) to 1 (top)
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Lerp factor 0.05 for smooth follow as requested
    parallax.current.x = THREE.MathUtils.lerp(parallax.current.x, mouse.current.x, 0.05);
    parallax.current.y = THREE.MathUtils.lerp(parallax.current.y, mouse.current.y, 0.05);
  });

  return parallax.current;
};

export default useParallax;
