import * as THREE from 'three';

/**
 * Depth Zones Configuration
 */
export const DEPTH_ZONES = {
  SUNLIT: {
    start: 0,
    end: 0.33,
    top: '#0E7490',
    bottom: '#0891B2',
    accent: '#22d3ee'
  },
  TWILIGHT: {
    start: 0.33,
    end: 0.66,
    top: '#1E3A5F',
    bottom: '#0F2040',
    accent: '#3b82f6'
  },
  ABYSSAL: {
    start: 0.66,
    end: 1.0,
    top: '#020A12',
    bottom: '#000000',
    accent: '#00FF88'
  }
};

const colorA = new THREE.Color();
const colorB = new THREE.Color();

export const interpolateColor = (color1, color2, t) => {
  colorA.set(color1);
  colorB.set(color2);
  colorA.lerp(colorB, t);
  return `#${colorA.getHexString()}`;
};

export const getInterpolatedZone = (progress) => {
  if (progress < 0.33) {
    const t = progress / 0.33;
    return {
      accent: interpolateColor(DEPTH_ZONES.SUNLIT.accent, DEPTH_ZONES.TWILIGHT.accent, t),
      bg: interpolateColor(DEPTH_ZONES.SUNLIT.top, DEPTH_ZONES.TWILIGHT.top, t)
    };
  } else if (progress < 0.66) {
    const t = (progress - 0.33) / 0.33;
    return {
      accent: interpolateColor(DEPTH_ZONES.TWILIGHT.accent, DEPTH_ZONES.ABYSSAL.accent, t),
      bg: interpolateColor(DEPTH_ZONES.TWILIGHT.top, DEPTH_ZONES.ABYSSAL.top, t)
    };
  } else {
    return {
      accent: DEPTH_ZONES.ABYSSAL.accent,
      bg: DEPTH_ZONES.ABYSSAL.top
    };
  }
};

