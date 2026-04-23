import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { useScroll } from '../context/ScrollContext';
import disposalManager from '../utils/DisposalManager';

// --- Geometry Generation Functions ---

const createBrainCoralGeometry = () => {
  const geo = new THREE.SphereGeometry(0.5, 32, 32);
  return disposalManager.track(geo);
};

const createStaghornCoralGeometry = () => {
  const points = [];
  const buildBranch = (start, dir, len, depth) => {
    const end = start.clone().add(dir.clone().multiplyScalar(len));
    points.push(start, end);

    if (depth < 3) {
      const splitPoint = start.clone().add(dir.clone().multiplyScalar(len * 0.7));
      
      const dir1 = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.6).normalize();
      const dir2 = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.6).normalize();
      
      buildBranch(splitPoint, dir1, len * 0.6, depth + 1);
      buildBranch(splitPoint, dir2, len * 0.6, depth + 1);
    }
  };

  buildBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0.8, 0);
  
  // TubeGeometry from the calculated points is complex because it expects a single curve.
  // Instead, let's merge multiple cylinders for branching.
  const geometries = [];
  const buildBranchMeshes = (start, dir, len, depth) => {
    const end = start.clone().add(dir.clone().multiplyScalar(len));
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    const geo = new THREE.CylinderGeometry(0.04 * (1 - depth * 0.2), 0.06 * (1 - depth * 0.2), len, 8);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    geo.applyQuaternion(quaternion);
    geo.translate(center.x, center.y, center.z);
    geometries.push(geo);

    if (depth < 3) {
      const splitPoint = start.clone().add(dir.clone().multiplyScalar(len * 0.7));
      const dir1 = dir.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.6).normalize();
      const dir2 = dir.clone().applyAxisAngle(new THREE.Vector3(-1, 0, 1), 0.6).normalize();
      buildBranchMeshes(splitPoint, dir1, len * 0.7, depth + 1);
      buildBranchMeshes(splitPoint, dir2, len * 0.7, depth + 1);
    }
  };

  buildBranchMeshes(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0.8, 0);
  const merged = mergeGeometries(geometries);
  geometries.forEach(g => g.dispose());
  return disposalManager.track(merged);
};

const createFanCoralGeometry = () => {
  return disposalManager.track(new THREE.PlaneGeometry(0.8, 1.2, 20, 30));
};

const createTubeCoralGeometry = () => {
  const geometries = [];
  for (let i = 0; i < 8; i++) {
    const h = 0.4 + Math.random() * 0.4;
    const geo = new THREE.CylinderGeometry(0.03, 0.05, h, 8);
    
    // Add color attribute for tips (Prompt 27: top ring vertices get orange color)
    const colors = new Float32Array(geo.attributes.position.count * 3);
    const pos = geo.attributes.position.array;
    for (let j = 0; j < geo.attributes.position.count; j++) {
      if (pos[j * 3 + 1] > h / 2 - 0.01) {
        colors[j * 3] = 1.0;     // R
        colors[j * 3 + 1] = 0.4; // G
        colors[j * 3 + 2] = 0.0; // B
      } else {
        colors[j * 3] = 0.6;
        colors[j * 3 + 1] = 0.3;
        colors[j * 3 + 2] = 0.2;
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const angle = (i / 8) * Math.PI * 2;
    const dist = 0.1;
    geo.translate(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
    geo.rotateX((Math.random() - 0.5) * 0.3);
    geo.rotateZ((Math.random() - 0.5) * 0.3);
    geometries.push(geo);
  }
  const merged = mergeGeometries(geometries);
  geometries.forEach(g => g.dispose());
  return disposalManager.track(merged);
};

const createBubbleCoralGeometry = () => {
  const geometries = [];
  for (let i = 0; i < 12; i++) {
    const r = 0.06 + Math.random() * 0.08;
    const geo = new THREE.SphereGeometry(r, 8, 8);
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.3;
    geo.translate(Math.cos(angle) * dist, Math.random() * 0.2, Math.sin(angle) * dist);
    geometries.push(geo);
  }
  const merged = mergeGeometries(geometries);
  geometries.forEach(g => g.dispose());
  return disposalManager.track(merged);
};

const createFireCoralGeometry = () => {
  const geometries = [];
  for (let i = 0; i < 6; i++) {
    const h = 0.3 + Math.random() * 0.3;
    const geo = new THREE.CylinderGeometry(0.02, 0.04, h, 6);
    geo.translate(0, h / 2, 0);
    geo.rotateX((Math.random() - 0.5) * 1.0);
    geo.rotateZ((Math.random() - 0.5) * 1.0);
    geo.translate((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2);
    geometries.push(geo);
  }
  const merged = mergeGeometries(geometries);
  geometries.forEach(g => g.dispose());
  return disposalManager.track(merged);
};

const createKelpGeometry = () => {
  const geometries = [];
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.PlaneGeometry(0.04, 1.2, 1, 8);
    const angle = (i / 5) * Math.PI * 2;
    geo.translate(Math.cos(angle) * 0.1, 0.6, Math.sin(angle) * 0.1);
    geo.rotateY(Math.random() * Math.PI);
    geometries.push(geo);
  }
  const merged = mergeGeometries(geometries);
  geometries.forEach(g => g.dispose());
  return disposalManager.track(merged);
};

// --- Species Components ---

const SeaGrass = ({ position, uTime, uScrollProgress }) => {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime, uScrollProgress },
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        
        float sway = sin(uTime * 1.5 + worldPos.x * 2.0) * 0.15;
        float heightFactor = pow(uv.y, 2.0);
        pos.x += sway * heightFactor;
        pos.z += cos(uTime * 1.2 + worldPos.z) * 0.08 * heightFactor;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uScrollProgress;
      void main() {
        vec3 color = mix(vec3(0.1, 0.25, 0.1), vec3(0.2, 0.5, 0.1), vUv.y);
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [uTime, uScrollProgress]);
  const geo = useMemo(createKelpGeometry, []);
  return <mesh position={position} scale={1.3} geometry={geo} material={material} />;
};

const FireCoral = ({ position, uTime, uScrollProgress }) => {
  const geo = useMemo(createFireCoralGeometry, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime, uScrollProgress },
    transparent: true,
    vertexShader: `
      uniform float uTime;
      void main() {
        vec3 pos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        pos.x += sin(uTime * 0.8 + worldPos.x) * 0.03 * (pos.y + 0.2);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uScrollProgress;
      void main() {
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(0.7, 0.1, 0.1, alpha); // Deep Red
      }
    `
  }), [uTime, uScrollProgress]);
  return <mesh position={position} scale={1.3} geometry={geo} material={material} />;
};

const BrainCoral = ({ position, uTime, uScrollProgress }) => {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { 
      uTime, 
      uScrollProgress,
      uColor: { value: new THREE.Color('#D2B48C') }, // Tan
      uHighlight: { value: new THREE.Color('#8B4513') } // Brown
    },
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      varying float vDisplace;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float groove = sin(atan(pos.y, pos.x) * 12.0) * 0.06;
        pos += normal * groove;
        vDisplace = groove;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        pos.x += sin(uTime * 0.4 + worldPos.x * 0.5) * 0.02 * (pos.y + 0.5);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vDisplace;
      uniform vec3 uColor;
      uniform vec3 uHighlight;
      uniform float uScrollProgress;
      void main() {
        vec3 color = mix(uColor, uHighlight, smoothstep(0.0, 0.06, vDisplace));
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [uTime, uScrollProgress]);
  const geo = useMemo(createBrainCoralGeometry, []);
  return <mesh position={position} scale={1.3} geometry={geo} material={material} />;
};

const StaghornCoral = ({ position, uTime, uScrollProgress }) => {
  const geo = useMemo(createStaghornCoralGeometry, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime, uScrollProgress },
    transparent: true,
    vertexShader: `
      uniform float uTime;
      void main() {
        vec3 pos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        pos.x += sin(uTime * 0.4 + worldPos.x * 0.5) * 0.02 * (pos.y * 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uScrollProgress;
      void main() {
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(1.0, 0.5, 0.3, alpha); // Coral Orange
      }
    `
  }), [uTime, uScrollProgress]);
  return <mesh position={position} scale={1.3} geometry={geo} material={material} />;
};

const FanCoral = ({ position, uTime, uScrollProgress }) => {
  const geo = useMemo(createFanCoralGeometry, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime, uScrollProgress },
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        pos.x += sin(uTime * 0.4 + worldPos.x * 0.5) * 0.02 * (pos.y + 0.6);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uScrollProgress;
      void main() {
        float lace = step(0.85, sin(vUv.x * 30.0) * sin(vUv.y * 20.0));
        if (lace < 0.1) discard;
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(0.58, 0.44, 0.86, alpha); // Soft Purple
      }
    `
  }), [uTime, uScrollProgress]);
  return <mesh position={position} scale={1.3} rotation={[0, Math.random() * Math.PI, 0]} geometry={geo} material={material} />;
};

const TubeCoral = ({ position, uTime, uScrollProgress }) => {
  const geo = useMemo(createTubeCoralGeometry, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime, uScrollProgress },
    vertexColors: true,
    transparent: true,
    vertexShader: `
      varying vec3 vColor;
      varying float vY;
      uniform float uTime;
      void main() {
        vColor = color;
        vY = position.y;
        vec3 pos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        pos.x += sin(uTime * 0.4 + worldPos.x * 0.5) * 0.02 * (pos.y * 3.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vY;
      uniform float uScrollProgress;
      void main() {
        vec3 color = vColor;
        if (vColor.r > 0.9 && vColor.g < 0.5) {
          color = vec3(1.0, 0.84, 0.0); // Gold/Yellow
        }
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [uTime, uScrollProgress]);
  return <mesh position={position} scale={1.3} geometry={geo} material={material} />;
};

const BubbleCoral = ({ position, uTime, uScrollProgress }) => {
  const geo = useMemo(createBubbleCoralGeometry, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime, uScrollProgress },
    transparent: true,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      uniform float uTime;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        vec3 pos = position;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        pos.x += sin(uTime * 0.4 + worldPos.x * 0.5) * 0.02 * 0.5;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      uniform float uScrollProgress;
      void main() {
        float fresnel = pow(1.0 - dot(vNormal, vViewDir), 3.0);
        vec3 base = vec3(0.96, 0.96, 0.86); // Beige
        vec3 sheen = vec3(0.1, 0.1, 0.1) * fresnel;
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(base + sheen, alpha);
      }
    `
  }), [uTime, uScrollProgress]);
  return <mesh position={position} scale={1.3} geometry={geo} material={material} />;
};

// --- Main System ---

const CoralSystem = () => {
  const { progress } = useScroll();
  const uTime = useRef({ value: 0 });
  const uScrollProgress = useRef({ value: 0 });
  const { invalidate } = useThree();

  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const corals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
      const x = seededRandom(i * 7.3 + 2.1) * 45 - 22.5;
      const z = seededRandom(i * 3.4 + 1.5) * 35 - 17.5;
      const type = Math.floor(seededRandom(i * 9.2 + 4.1) * 7);
      arr.push({ id: i, x, z, type });
    }
    return arr;
  }, []);

  useFrame((state) => {
    uTime.current.value = state.clock.getElapsedTime();
    uScrollProgress.current.value = progress.current;
    invalidate();
  });

  return (
    <group name="CoralReef" position={[0, -11.9, 0]}>
      {corals.map((c) => {
        const pos = [c.x, 0, c.z];
        switch (c.type) {
          case 0: return <BrainCoral key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          case 1: return <StaghornCoral key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          case 2: return <FanCoral key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          case 3: return <TubeCoral key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          case 4: return <BubbleCoral key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          case 5: return <SeaGrass key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          case 6: return <FireCoral key={c.id} position={pos} uTime={uTime.current} uScrollProgress={uScrollProgress.current} />;
          default: return null;
        }
      })}
    </group>
  );
};

export default CoralSystem;
