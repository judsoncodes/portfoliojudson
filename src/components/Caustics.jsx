import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import disposalManager from '../utils/DisposalManager';

const CausticsMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ffcc') },
    uScroll: { value: 0 },
    uOpacity: { value: 0.2 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uScroll;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    // Standard Voronoi/Cellular Noise for Caustics
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453123);
    }

    float voronoi(vec2 x) {
      vec2 n = floor(x);
      vec2 f = fract(x);
      float m = 1.0;
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j));
          vec2 o = hash(n + g);
          o = 0.5 + 0.5 * sin(uTime * 0.8 + 6.2831 * o);
          vec2 r = g + o - f;
          float d = dot(r, r);
          if (d < m) m = d;
        }
      }
      return sqrt(m);
    }

    void main() {
      // Create two layers of moving voronoi
      vec2 uv = vUv * 12.0;
      float c1 = voronoi(uv + uTime * 0.1);
      float c2 = voronoi(uv * 1.5 - uTime * 0.15);
      
      // Combine for "web" effect
      float caustic = pow(1.0 - min(c1, c2), 8.0);
      
      // Depth falloff (fade as we go deeper into the abyss)
      float depthFactor = smoothstep(0.8, 0.2, uScroll);
      
      // Fade near edges of the plane
      float edgeFade = smoothstep(0.5, 0.2, abs(vUv.x - 0.5)) * smoothstep(0.5, 0.2, abs(vUv.y - 0.5));
      
      vec3 finalColor = uColor * caustic * 2.0;
      float alpha = caustic * uOpacity * depthFactor * edgeFade;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const Caustics = () => {
  const meshRef = useRef();
  const scroll = useScroll();
  
  const geometry = useMemo(() => disposalManager.track(new THREE.PlaneGeometry(100, 100)), []);
  const material = useMemo(() => disposalManager.track(new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(CausticsMaterial.uniforms),
    vertexShader: CausticsMaterial.vertexShader,
    fragmentShader: CausticsMaterial.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = t;
      meshRef.current.material.uniforms.uScroll.value = scroll.progress.current;
      
      // Move the caustics with the camera but slightly slower for parallax
      meshRef.current.position.y = -10 - (scroll.progress.current * 10);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={material} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -5, 0]} 
    />
  );
};

export default Caustics;
