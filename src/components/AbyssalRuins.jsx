import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import { getInterpolatedZone } from '../utils/depthZones';

// GLSL 3D Simplex Noise Function
const snoise = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; 
  vec3 x3 = x0 - D.yyy;      
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
${snoise}
uniform float uTime;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  // Slow, massive undulating waves
  float noise1 = snoise(position * 0.12 + uTime * 0.15) * 2.5;
  // Jagged, fast micro-glitches and crags
  float noise2 = snoise(position * 0.5 - uTime * 0.3) * 0.6;
  
  float totalNoise = noise1 + noise2;
  vNoise = totalNoise;
  
  // Physically displace the vertex
  vec3 newPosition = position + normal * totalNoise;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz; // Pass for accurate fragment lighting
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 uColor;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  // Reconstruct the true surface normal from the distorted geometry
  vec3 dx = dFdx(vViewPosition);
  vec3 dy = dFdy(vViewPosition);
  vec3 N = normalize(cross(dx, dy));
  
  // Top-down abyssal lighting
  vec3 lightDir = normalize(vec3(0.3, 1.0, 0.4));
  float diff = max(dot(N, lightDir), 0.0);
  
  // Base color: Wet obsidian/liquid metal
  vec3 baseColor = vec3(0.01, 0.02, 0.03) * (diff * 0.9 + 0.1);
  
  // Fresnel for a glassy, specular reflection
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - max(dot(N, viewDir), 0.0), 5.0);
  baseColor += vec3(0.2, 0.4, 0.5) * fresnel * 0.6;
  
  // Map noise (-3.0 to 3.0 approx) to 0.0 - 1.0 range
  float normalizedNoise = (vNoise + 3.1) / 6.2;
  
  // Make the deep, dark valleys violently glow with the theme color
  float glowIntensity = pow(1.0 - clamp(normalizedNoise, 0.0, 1.0), 16.0) * 8.0;
  
  vec3 finalColor = baseColor + (uColor * glowIntensity);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Creates a soft radial gradient for the background aura
function createRadialGradient() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.4)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

const TheAbyssalHeart = () => {
  const meshRef = useRef();
  const auraRef = useRef();
  const lightRef = useRef();
  const { progress } = useScroll();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#39FF14') }
  }), []);

  const auraTexture = useMemo(() => createRadialGradient(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    
    const zone = getInterpolatedZone(progress.current ?? 0);
    const color = new THREE.Color(zone.accent);
    uniforms.uColor.value.copy(color);

    if (meshRef.current) {
       // Ominous, slow planetary rotation
       meshRef.current.rotation.y = t * 0.08;
       meshRef.current.rotation.z = t * 0.04;
    }
    
    if (auraRef.current) {
        auraRef.current.material.color.copy(color);
        // Pulse the aura
        const scale = 1.0 + Math.sin(t * 1.5) * 0.1;
        auraRef.current.scale.set(scale, scale, 1);
    }

    if (lightRef.current) {
        lightRef.current.color.copy(color);
        lightRef.current.intensity = 4.0 + Math.sin(t * 3.0) * 2.0;
    }
  });

  return (
    <group position={[0, -14, -65]}>
      {/* The writhing, distorted liquid-metal core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[16, 50]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          extensions={{ derivatives: true }} // Required for true normal reconstruction
        />
      </mesh>
      
      {/* Massive glowing halo illuminating the fog behind it */}
      <mesh ref={auraRef} position={[0, 0, -5]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial 
           transparent 
           opacity={0.15} 
           blending={THREE.AdditiveBlending}
           depthWrite={false}
           map={auraTexture}
        />
      </mesh>
      
      {/* Dynamic light casting onto the seabed and surrounding ruins */}
      <pointLight ref={lightRef} distance={150} decay={1.5} />
    </group>
  );
};

export default function AbyssalRuins() {
  return (
    <group>
       <TheAbyssalHeart />
    </group>
  );
}
