import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

/**
 * Hook to manage scroll-based depth progress.
 * Intercepts wheel events on the canvas and maintains a lerped progress value (0 to 1).
 */
const useScrollDepth = () => {
  const { gl } = useThree();
  const scrollProgress = useRef(0);
  const targetProgress = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    const handleWheel = (e) => {
      // Prevent default scrolling behavior
      e.preventDefault();
      
      // Update target progress with a sensitivity factor
      // deltaY is typically around 100 per notch, we want 0->1 range over a few scrolls
      const sensitivity = 0.0005; 
      targetProgress.current = Math.max(0, Math.min(1, targetProgress.current + e.deltaY * sensitivity));
    };

    const canvas = gl.domElement;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [gl]);

  useFrame(() => {
    // Spring physics: current = current + (target - current) * lerpFactor
    // Using the requested lerp factor of 0.06
    scrollProgress.current += (targetProgress.current - scrollProgress.current) * 0.06;
  });

  return scrollProgress;
};

export default useScrollDepth;
