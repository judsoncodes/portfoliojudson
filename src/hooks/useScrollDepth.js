import { useEffect, useRef } from 'react';

/**
 * Hook to manage scroll-based depth progress.
 * Independent of R3F to allow usage in both DOM and WebGL contexts.
 */
const useScrollDepth = () => {
  const scrollProgress = useRef(0);
  const targetProgress = useRef(0);
  const requestRef = useRef();

  const animate = () => {
    // Smoothly lerp current progress toward target
    // current = current + (target - current) * lerpFactor
    scrollProgress.current += (targetProgress.current - scrollProgress.current) * 0.06;
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return { progress: scrollProgress, target: targetProgress };
};

export default useScrollDepth;
