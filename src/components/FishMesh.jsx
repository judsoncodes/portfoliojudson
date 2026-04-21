import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createFlock } from '../utils/boids';
import useCursorWorld from '../hooks/useCursorWorld';
import fishVert from '../shaders/fish.vert';
import fishFrag from '../shaders/fish.frag';

const MAX_FISH_COUNT = 150;

const FishMesh = ({ 
  foodRef, 
  count = 20, 
  speed = 1.0, 
  bounds = { x: 40, y: 25, z: 30 },
  palette = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490']
}) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Custom Hook for cursor tracking
  const { getLerpedCursor } = useCursorWorld();
  
  // Create Flock
  const boids = useMemo(() => createFlock(count, bounds, speed), [count, bounds, speed]);

  // Instance Attributes
  const colors = useMemo(() => {
    const data = new Float32Array(count * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      color.set(palette[Math.floor(Math.random() * palette.length)]);
      data[i * 3] = color.r;
      data[i * 3 + 1] = color.g;
      data[i * 3 + 2] = color.b;
    }
    return data;
  }, [count, palette]);

  const instanceIds = useMemo(() => {
    const data = new Float32Array(count);
    for (let i = 0; i < count; i++) data[i] = Math.random();
    return data;
  }, [count]);

  // Sleek Original Geometry
  const geometry = useMemo(() => {
    const bodyGeo = new THREE.SphereGeometry(0.2, 16, 16);
    bodyGeo.scale(0.5, 1.2, 2.8);
    
    const tailTop = new THREE.ConeGeometry(0.1, 0.8, 3);
    tailTop.rotateX(Math.PI / 2);
    tailTop.rotateZ(Math.PI / 5);
    tailTop.translate(0, 0.25, -0.8);
    
    const tailBottom = tailTop.clone();
    tailBottom.rotateZ(Math.PI / 1.6);
    tailBottom.translate(0, -0.5, 0);

    const sideFinL = new THREE.ConeGeometry(0.04, 0.5, 3);
    sideFinL.rotateZ(Math.PI / 3);
    sideFinL.translate(-0.2, 0, 0.3);
    
    const sideFinR = sideFinL.clone();
    sideFinR.scale(-1, 1, 1);
    sideFinR.translate(0.4, 0, 0);

    const merged = mergeGeometries([bodyGeo, tailTop, tailBottom, sideFinL, sideFinR]);
    merged.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    merged.setAttribute('aInstanceId', new THREE.InstancedBufferAttribute(instanceIds, 1));
    
    return merged;
  }, [colors, instanceIds]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  const lastPing = useRef({ pos: new THREE.Vector3(), time: -999 });

  useEffect(() => {
    const onPing = (e) => {
      lastPing.current = { 
        pos: e.detail.position.clone(), 
        time: performance.now() / 1000 
      };
    };
    window.addEventListener('sonar-ping', onPing);
    return () => window.removeEventListener('sonar-ping', onPing);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    uniforms.uTime.value = time;

    const cursor = getLerpedCursor(0.1);
    const pingAge = time - lastPing.current.time;

    boids.forEach((boid, i) => {
      boid.update(boids, bounds, cursor, foodRef?.current || []);
      
      // Apply Sonar Shockwave Force
      if (pingAge < 1.0) {
        const distToPing = boid.position.distanceTo(lastPing.current.pos);
        if (distToPing < 8.0) {
          const force = (1.0 - pingAge) * 0.15 * (1.0 - distToPing / 8.0);
          const push = new THREE.Vector3().subVectors(boid.position, lastPing.current.pos).normalize().multiplyScalar(force);
          boid.velocity.add(push);
        }
      }

      dummy.position.copy(boid.position);
      
      // Scale — hero fish (first 3) are larger
      const s = i < 3 ? 1.8 : 1.0;
      dummy.scale.set(s, s, s);
      
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
    };
  }, [geometry]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, null, count]}
      frustumCulled={false}
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
