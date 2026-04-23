import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import useDeviceProfile from '../hooks/useDeviceProfile';
import disposalManager from '../utils/DisposalManager';

/**
 * Advanced Volumetric Lighting System
 * Implements physically believable underwater scattering with anisotropic light bias,
 * depth-based color absorption, and noise-driven caustic distortion.
 */

// 1. Procedural Noise Texture for Caustic Breakup
const createNoiseTexture = () => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const val = Math.random() * 255;
    imgData.data[i] = val;
    imgData.data[i + 1] = val;
    imgData.data[i + 2] = val;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

const VolumetricRayMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#88ccff') },
    uDepthProgress: { value: 0 },
    uNoiseTex: { value: null },
    uIntensity: { value: 1.0 },
    uLayer: { value: 0 }, // 0 for soft, 1 for sharp
    uLightPos: { value: new THREE.Vector3(0, 15, -10) },
    uRandomOffset: { value: 0 }
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
    uniform float uDepthProgress;
    uniform sampler2D uNoiseTex;
    uniform float uIntensity;
    uniform float uLayer;
    uniform vec3 uLightPos;
    uniform float uRandomOffset;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // 1. Noise-Driven Caustic Distortion
      float noiseVal = texture2D(uNoiseTex, vUv * 0.5 + uTime * 0.02 + uRandomOffset).r;
      vec2 distortedUv = vUv;
      distortedUv.x += (noiseVal - 0.5) * 0.05;
      
      // 2. Base Gradient (Radial + Linear)
      float gradient = smoothstep(1.0, 0.0, distortedUv.y);
      float radialFalloff = smoothstep(0.5, 0.2, abs(distortedUv.x - 0.5));
      
      // 3. Anisotropic Scattering Approximation
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 lightDir = normalize(uLightPos - vWorldPosition);
      float scatter = pow(max(dot(viewDir, lightDir), 0.0), 1.5) * 0.7 + 0.3;
      
      // 4. Depth Absorption & Falloff
      float depthFalloff = exp(-vWorldPosition.y * -0.05 * 1.2); 
      float scrollFalloff = smoothstep(1.0, 0.6, uDepthProgress);
      
      // 5. Color Absorption (Lerp to Deep Blue)
      vec3 shallowColor = uColor;
      vec3 deepColor = vec3(0.02, 0.08, 0.2);
      vec3 finalColor = mix(shallowColor, deepColor, uDepthProgress * 0.8);
      
      // 6. Layer Specifics
      float layerAlpha = (uLayer > 0.5) ? pow(gradient, 2.0) * 1.5 : gradient * 0.6;
      
      // 7. Micro-Flicker
      float flicker = 1.0 + (noiseVal - 0.5) * 0.05 * sin(uTime * 0.5);
      
      float alpha = layerAlpha * radialFalloff * scatter * depthFalloff * scrollFalloff * uIntensity * flicker;
      
      gl_FragColor = vec4(finalColor, alpha * 0.15);
    }
  `
};

const VolumetricLighting = () => {
  const { mouse, camera } = useThree();
  const scroll = useScroll();
  const profile = useDeviceProfile();
  
  const sunRef = useRef();
  const haloRef = useRef();
  const godRayGroupRef = useRef();

  // Resources
  const sunGeo = useMemo(() => disposalManager.track(new THREE.SphereGeometry(2, 32, 32)), []);
  const haloGeo = useMemo(() => disposalManager.track(new THREE.SphereGeometry(6, 32, 32)), []);
  const rayGeo = useMemo(() => disposalManager.track(new THREE.PlaneGeometry(1, 1)), []);
  const noiseTex = useMemo(() => disposalManager.track(createNoiseTexture()), []);

  // Ray Layer Configurations
  const rays = useMemo(() => {
    const count = profile.isMobile ? 10 : 22;
    const items = [];
    for (let i = 0; i < count; i++) {
      const isSharp = i % 3 === 0; // Every 3rd ray is sharp
      items.push({
        rotation: [0, 0, (i / count) * Math.PI * 2 + Math.random() * 0.2],
        scale: isSharp ? [0.8, 25, 1] : [2.5, 35, 1],
        speed: 0.05 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        layer: isSharp ? 1 : 0,
        randomOffset: Math.random()
      });
    }
    return items;
  }, [profile.isMobile]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = scroll.progress.current;

    // A. Surface Origin Distortion
    const driftX = Math.sin(t * 0.2) * 0.5;
    const driftZ = Math.cos(t * 0.15) * 0.3;
    const mouseX = mouse.x * 2;
    const mouseY = mouse.y * 2;
    
    const lightPos = new THREE.Vector3(driftX + mouseX, 15, driftZ - 10 + mouseY);

    if (sunRef.current) {
      sunRef.current.position.copy(lightPos);
      const pulse = 1 + Math.sin(t * 1.5) * 0.08;
      sunRef.current.scale.setScalar(pulse);
      sunRef.current.material.emissiveIntensity = 5 + Math.sin(t * 2) * 1;
    }

    if (godRayGroupRef.current) {
      godRayGroupRef.current.position.copy(lightPos);
      
      godRayGroupRef.current.children.forEach((child, i) => {
        const r = rays[i];
        if (r && child.material.uniforms) {
          child.rotation.z += r.speed * 0.005;
          child.material.uniforms.uTime.value = t;
          child.material.uniforms.uDepthProgress.value = s;
          child.material.uniforms.uLightPos.value.copy(lightPos);
          
          // Subtle wobble to origin
          child.position.x = Math.sin(t * 0.2 + i) * 0.05;
          child.position.y = Math.cos(t * 0.15 + i) * 0.03;
        }
      });
    }

    if (haloRef.current) {
      haloRef.current.position.copy(lightPos);
      haloRef.current.scale.setScalar(1.5 + Math.sin(t * 1.5) * 0.1);
      haloRef.current.material.opacity = 0.05 + Math.sin(t * 0.5) * 0.02;
    }
  });

  return (
    <group name="VolumetricSystem">
      {/* The Sun Core */}
      <mesh ref={sunRef} position={[0, 15, -10]} geometry={sunGeo}>
        <meshStandardMaterial 
          color="#88ccff" 
          emissive="#88ccff" 
          emissiveIntensity={10} 
          toneMapped={false} 
        />
      </mesh>

      {/* The Diffusion Halo */}
      <mesh ref={haloRef} position={[0, 15, -10]} geometry={haloGeo}>
        <meshBasicMaterial 
          color="#aee6ff" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
        />
      </mesh>

      {/* God Rays Group */}
      <group ref={godRayGroupRef}>
        {rays.map((r, i) => (
          <mesh key={i} rotation={r.rotation} scale={r.scale} geometry={rayGeo}>
            <shaderMaterial 
              transparent 
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              vertexShader={VolumetricRayMaterial.vertexShader}
              fragmentShader={VolumetricRayMaterial.fragmentShader}
              uniforms={{
                ...THREE.UniformsUtils.clone(VolumetricRayMaterial.uniforms),
                uNoiseTex: { value: noiseTex },
                uLayer: { value: r.layer },
                uRandomOffset: { value: r.randomOffset }
              }}
            />
          </mesh>
        ))}
      </group>

      {/* Atmospheric Fog Sync Mesh */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[120, 120, 120]} />
        <meshBasicMaterial color="#010b14" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

export default VolumetricLighting;
