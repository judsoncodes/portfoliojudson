import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const createFlipper = (isFront) => {
  const geo = new THREE.BufferGeometry();
  const length = isFront ? 0.9 : 0.5;
  const width = isFront ? 0.3 : 0.2;
  const verts = new Float32Array([
    0, 0, 0, -width, 0, 0, width, 0, 0,
    -width * 1.2, 0.02, length * 0.4, width * 1.2, 0.02, length * 0.4,
    -width * 1.4, 0.04, length * 0.7, width * 1.4, 0.04, length * 0.7,
    -width * 0.6, 0.02, length * 0.9, width * 0.6, 0.02, length * 0.9,
    0, 0.01, length, 0, -0.04, length * 0.5
  ]);
  const uvs = new Float32Array([
    0.5, 0, 0, 0, 1, 0, 0.1, 0.4, 0.9, 0.4, 0, 0.7, 1, 0.7, 0.2, 0.9, 0.8, 0.9, 0.5, 1, 0.5, 0.5
  ]);
  const indices = [
    0, 1, 3, 0, 3, 5, 0, 5, 7, 0, 7, 9, 0, 2, 4, 0, 4, 6, 0, 6, 8, 0, 8, 9,
    1, 3, 4, 1, 4, 2, 3, 5, 6, 3, 6, 4, 5, 7, 8, 5, 8, 6, 7, 9, 8,
    0, 1, 10, 1, 3, 10, 3, 5, 10, 5, 7, 10, 7, 9, 10,
    0, 2, 10, 2, 4, 10, 4, 6, 10, 6, 8, 10, 8, 9, 10
  ];
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
};

const TurtleInstance = ({ data, index }) => {
  const groupRef = useRef();
  const frontLeftRef = useRef();
  const frontRightRef = useRef();
  const headRef = useRef();

  const { shellGeo, headGeo, bellyGeo, flipperFront, flipperRear } = useMemo(() => {
    const sGeo = new THREE.SphereGeometry(0.65, 32, 24);
    sGeo.scale(1.2, 0.45, 1.5);
    const pos = sGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const ridge = Math.max(0, y) * Math.exp(-x * x * 5.0) * 0.15;
      const wave = Math.max(0, Math.sin(z * 4.0) * 0.04 * Math.max(0, y));
      pos.setY(i, y + ridge + wave);
    }
    pos.needsUpdate = true;
    sGeo.computeVertexNormals();
    return {
      shellGeo: sGeo,
      headGeo: new THREE.SphereGeometry(0.25, 20, 20).scale(0.9, 0.8, 1.3),
      bellyGeo: new THREE.SphereGeometry(0.55, 16, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5).scale(1.1, 0.12, 1.4),
      flipperFront: createFlipper(true),
      flipperRear: createFlipper(false)
    };
  }, []);

  const shellMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ 
      color: '#1a3c1a', // Deep Forest Green
      roughness: 0.15,
      metalness: 0.2,
      emissive: '#0a1a0a',
      side: THREE.DoubleSide
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = `varying vec2 vUvScale; ${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvUvScale = uv;');
      shader.fragmentShader = `
        varying vec2 vUvScale;
        vec2 hash2(vec2 p) {
          p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
          return fract(sin(p)*43758.5453);
        }
        ${shader.fragmentShader}
      `.replace('#include <color_fragment>', `
        #include <color_fragment>
        vec2 uv = vUvScale * 5.5;
        vec2 cell = floor(uv);
        vec2 f = fract(uv);
        float minDist = 1.0;
        for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash2(cell + neighbor);
          minDist = min(minDist, length(neighbor + point - f));
        }
        float scute = smoothstep(0.04, 0.12, minDist);
        // Rich cinematic colors: Deep emerald to Golden Moss
        vec3 plateColor = vec3(0.04, 0.15, 0.06); 
        vec3 edgeColor = vec3(0.4, 0.45, 0.15); 
        diffuseColor.rgb = mix(plateColor, edgeColor, scute);
        // Add subtle pearlescence/fresnel
        float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0,0,1)), 3.0);
        diffuseColor.rgb += vec3(0.1, 0.2, 0.05) * fresnel;
      `);
    };
    return mat;
  }, []);

  const skinMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ color: '#2d4d2d', roughness: 0.7 });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = `varying vec2 vUvScale; ${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvUvScale = uv;');
      shader.fragmentShader = `varying vec2 vUvScale; ${shader.fragmentShader}`.replace('#include <color_fragment>', `
        #include <color_fragment>
        float scales = smoothstep(0.45, 0.55, sin(vUvScale.x * 80.0) * sin(vUvScale.y * 80.0));
        vec3 baseSkin = vec3(0.2, 0.35, 0.15);
        vec3 darkSkin = vec3(0.05, 0.12, 0.05);
        diffuseColor.rgb = mix(darkSkin, baseSkin, scales);
        // Yellow-cream underbelly/chin patches
        float patch = smoothstep(0.5, 0.8, vUvScale.y) * 0.6;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.8, 0.75, 0.4), patch);
      `);
    };
    return mat;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = data.seed;
    const speed = 0.07 + index * 0.015;

    // Gliding movement - Cinematic and smooth
    const x = Math.sin(t * speed + s) * 11 + Math.sin(t * 0.3 + s) * 2;
    const z = 7 + Math.cos(t * speed * 0.7 + s) * 6;
    const y = 1.0 + Math.sin(t * 0.15 + s) * 2.5;

    const dt = 0.1;
    const nx = Math.sin((t+dt) * speed + s) * 11 + Math.sin((t+dt) * 0.3 + s) * 2;
    const nz = 7 + Math.cos((t+dt) * speed * 0.7 + s) * 6;
    const ny = 1.0 + Math.sin((t+dt) * 0.15 + s) * 2.5;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      // Smooth interpolation for rotation
      const targetRotationY = Math.atan2(nx - x, nz - z);
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x = -(ny - y) * 1.2;
      groupRef.current.rotation.z = -(nx - x) * 0.8;
    }

    // Soaring flipper strokes - Slow and majestic
    const stroke = Math.sin(t * 1.2 + s);
    if (frontLeftRef.current) {
      frontLeftRef.current.rotation.x = stroke * 0.7;
      frontLeftRef.current.rotation.z = -0.3 + stroke * 0.4;
    }
    if (frontRightRef.current) {
      frontRightRef.current.rotation.x = Math.sin(t * 1.2 + s + Math.PI) * 0.7;
      frontRightRef.current.rotation.z = 0.3 - Math.sin(t * 1.2 + s + Math.PI) * 0.4;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.3 + s) * 0.2;
      headRef.current.rotation.x = Math.sin(t * 0.2 + s) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={data.scale * 0.7}>
      <mesh geometry={shellGeo} material={shellMat} />
      <mesh geometry={bellyGeo} material={new THREE.MeshStandardMaterial({ color: '#b5a67a', roughness: 0.8 })} position={[0, -0.05, 0]} />
      <group position={[0, 0.05, 0.7]}>
        <mesh rotation={[Math.PI/2, 0, 0]} position={[0,0,0.1]} geometry={new THREE.CylinderGeometry(0.14, 0.17, 0.25, 12)} material={skinMat} />
        <group ref={headRef} position={[0, 0.08, 0.25]}>
          <mesh geometry={headGeo} material={skinMat} />
          <mesh position={[0.18, 0.06, 0.08]} geometry={new THREE.SphereGeometry(0.04)} material={new THREE.MeshStandardMaterial({color:'#000'})} />
          <mesh position={[-0.18, 0.06, 0.08]} geometry={new THREE.SphereGeometry(0.04)} material={new THREE.MeshStandardMaterial({color:'#000'})} />
          <mesh position={[0, -0.02, 0.3]} geometry={new THREE.SphereGeometry(0.14, 12, 10)} material={skinMat} scale={[0.8, 0.7, 1.1]} />
        </group>
      </group>
      {/* Fins */}
      <group position={[-0.6, -0.05, 0.35]} rotation={[0, -0.1, -0.2]}>
        <mesh ref={frontLeftRef} geometry={flipperFront} material={skinMat} />
      </group>
      <group position={[0.5, -0.05, 0.35]} rotation={[0, 0.1, 0.2]}>
        <mesh ref={frontRightRef} geometry={flipperFront} material={skinMat} />
      </group>
      <group position={[-0.45, -0.08, -0.45]} rotation={[0, 0.3, -0.1]}>
        <mesh geometry={flipperRear} material={skinMat} />
      </group>
      <group position={[0.45, -0.08, -0.45]} rotation={[0, -0.3, 0.1]}>
        <mesh geometry={flipperRear} material={skinMat} />
      </group>
    </group>
  );
};

const SeaTurtle = () => {
  const turtles = [
    { scale: 1.0, seed: 0 },
    { scale: 0.8, seed: 20 },
    { scale: 0.6, seed: 40 },
    { scale: 0.9, seed: 60 },
    { scale: 0.7, seed: 80 }
  ];

  return (
    <group name="SeaTurtleGroup">
      <pointLight position={[0, 10, 10]} intensity={6} color="#ffffff" distance={40} decay={2} />
      <pointLight position={[0, -5, 5]} intensity={2} color="#0044ff" distance={30} decay={2} />
      {turtles.map((t, i) => <TurtleInstance key={i} data={t} index={i} />)}
    </group>
  );
};

export default SeaTurtle;
