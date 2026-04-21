import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * MemoryMonitor Component (Dev-only)
 * Polls renderer.info.memory and warns if thresholds are exceeded.
 */
const MemoryMonitor = () => {
  const { gl } = useThree();

  useEffect(() => {
    // Only run in development
    if (!import.meta.env.DEV) return;

    const interval = setInterval(() => {
      const memory = gl.info.memory;
      const programs = gl.info.programs?.length || 0;

      console.log(
        `[MemoryMonitor] Geometries: ${memory.geometries}, Textures: ${memory.textures}, Programs: ${programs}`
      );

      if (memory.geometries > 50) {
        console.warn(`[MemoryMonitor] HIGH GEOMETRY COUNT: ${memory.geometries}. Ensure disposal is working.`);
      }
      if (memory.textures > 20) {
        console.warn(`[MemoryMonitor] HIGH TEXTURE COUNT: ${memory.textures}. Consider using a TextureAtlas.`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gl]);

  return null;
};

export default MemoryMonitor;
