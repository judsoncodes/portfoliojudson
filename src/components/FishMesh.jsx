import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createFlock } from '../utils/boids';
import fishVert from '../shaders/fish.vert';
import fishFrag from '../shaders/fish.frag';

const MAX_FISH_COUNT = 150;
const BOUNDS = { x: 25, y: 18, z: 20 };

const FishMesh = () => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Create Flock
  const boids = useMemo(() => createFlock(MAX_FISH_COUNT, BOUNDS), []);

  // Instance Attributes
  const colors = useMemo(() => {
    const data = new Float32Array(MAX_FISH_COUNT * 3);
    const color = new THREE.Color();
    const palettes = ['#22d3ee', '#818cf8', '#2dd4bf', '#fb7185'];
    
    for (let i = 0; i < MAX_FISH_COUNT; i++) {
      color.set(palettes[Math.floor(Math.random() * palettes.length)]);
      data[i * 3] = color.r;
      data[i * 3 + 1] = color.g;
      data[i * 3 + 2] = color.b;
    }
    return data;
  }, []);

  const instanceIds = useMemo(() => {
    const data = new Float32Array(MAX_FISH_COUNT);
    for (let i = 0; i < MAX_FISH_COUNT; i++) data[i] = i;
    return data;
  }, []);

  // Improved Procedural Geometry
  const geometry = useMemo(() => {
    const bodyGeo = new THREE.SphereGeometry(0.2, 12, 12);
    bodyGeo.scale(0.6, 1.2, 2.5);
    
    const tailTop = new THREE.ConeGeometry(0.1, 0.6, 3);
    tailTop.rotateX(Math.PI / 2);
    tailTop.rotateZ(Math.PI / 4);
    tailTop.translate(0, 0.2, -0.7);
    
    const tailBottom = tailTop.clone();
    tailBottom.rotateZ(Math.PI / 2);
    tailBottom.translate(0, -0.4, 0);

    const sideFinL = new THREE.ConeGeometry(0.06, 0.4, 3);
    sideFinL.rotateZ(Math.PI / 2.5);
    sideFinL.translate(-0.18, 0, 0.25);
    
    const sideFinR = sideFinL.clone();
    sideFinR.scale(-1, 1, 1);
    sideFinR.translate(0.36, 0, 0);

    const dorsalFin = new THREE.ConeGeometry(0.04, 0.5, 3);
    dorsalFin.rotateX(Math.PI / 12);
    dorsalFin.translate(0, 0.35, 0.1);

    const merged = mergeGeometries([bodyGeo, tailTop, tailBottom, sideFinL, sideFinR, dorsalFin]);
    
    // Add instance attributes to geometry
    merged.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    merged.setAttribute('aInstanceId', new THREE.InstancedBufferAttribute(instanceIds, 1));
    
    return merged;
  }, [colors, instanceIds]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    uniforms.uTime.value = time;

    boids.forEach((boid, i) => {
      boid.update(boids, BOUNDS);
      dummy.position.copy(boid.position);
      
      if (boid.velocity.lengthSq() > 0.0001) {
        dummy.lookAt(
          boid.position.x + boid.velocity.x,
          boid.position.y + boid.velocity.y,
          boid.position.z + boid.velocity.z
        );
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      // material is ShaderMaterial, handled by R3F or manually
    };
  }, [geometry]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, null, MAX_FISH_COUNT]}
    >
      <shaderMaterial
        vertexShader={fishVert}
        fragmentShader={fishFrag}
        uniforms={uniforms}
        transparent
      />
    </instancedMesh>
  );
};

export default FishMesh;
