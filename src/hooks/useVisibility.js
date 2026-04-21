import { useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * useVisibility Hook
 * Uses IntersectionObserver for DOM elements and Frustum culling for Three.js objects.
 * Useful for pausing useFrame updates in off-screen components.
 */
const useVisibility = (ref, threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Frustum culling tools for Three.js objects
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Handle Three.js Objects
  useFrame((state) => {
    const obj = ref.current;
    if (!obj || obj instanceof Element) return;

    // Safety check: Frustum.intersectsObject requires geometry and a boundingSphere
    if (!obj.geometry) {
      // If it's a Group or Object3D without its own geometry, 
      // we assume it's visible for now to avoid expensive recursive Box3 checks.
      if (!isVisible) setIsVisible(true);
      return;
    }

    // Ensure bounding information is available
    if (obj.geometry.boundingSphere === null) {
      obj.geometry.computeBoundingSphere();
    }

    projScreenMatrix.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);
    
    try {
      const visible = frustum.intersectsObject(obj);
      if (visible !== isVisible) {
        setIsVisible(visible);
      }
    } catch (e) {
      // Fallback for any other unexpected Three.js internal errors
      if (!isVisible) setIsVisible(true);
    }
  });

  // Handle DOM Elements
  useEffect(() => {
    const el = ref.current;
    if (!el || !(el instanceof Element)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [ref, threshold, isVisible]);

  return isVisible;
};

export default useVisibility;

