import { useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const useCursorWorld = () => {
  const { mouse, camera, raycaster } = useThree();
  const cursorWorld = useRef(new THREE.Vector3());
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const lerpedCursor = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleMouseMove = () => {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, cursorWorld.current);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouse, camera, raycaster, plane]);

  // Expose a method to get lerped position in the loop
  const getLerpedCursor = (alpha = 0.1) => {
    lerpedCursor.current.lerp(cursorWorld.current, alpha);
    return lerpedCursor.current;
  };

  return { cursorWorld, getLerpedCursor };
};

export default useCursorWorld;
