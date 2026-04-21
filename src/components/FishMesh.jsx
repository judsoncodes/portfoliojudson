import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createFlock } from '../utils/boids';
import disposalManager from '../utils/DisposalManager';
import useCursorWorld from '../hooks/useCursorWorld';
import useVisibility from '../hooks/useVisibility';
import fishVert from '../shaders/fish.vert';
import fishFrag from '../shaders/fish.frag';

const LOD_DISTANCE = 20;
const _v1 = new THREE.Vector3();

const FishMesh = ({ 
  foodRef, 
  count = 20, 
  speed = 1.0, 
  bounds = { x: 40, y: 25, z: 30 },
  palette = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490']
}) => {
  const meshRef = useRef();
  const lodMeshRef = useRef();
  const groupRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { invalidate } = useThree();
  
  // Custom Hook for visibility-based pausing
  const isVisible = useVisibility(groupRef);
  
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

  // High-Poly Geometry
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

    const geometries = [bodyGeo, tailTop, tailBottom, sideFinL, sideFinR];
    const merged = disposalManager.track(mergeGeometries(geometries));
    geometries.forEach(g => g.dispose());

    merged.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    merged.setAttribute('aInstanceId', new THREE.InstancedBufferAttribute(instanceIds, 1));
    return merged;
  }, [colors, instanceIds]);

  // Low-Poly LOD Geometry (4-vertex billboard)
  const lodGeometry = useMemo(() => {
    const geo = disposalManager.track(new THREE.PlaneGeometry(0.6, 0.6));
    geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    geo.setAttribute('aInstanceId', new THREE.InstancedBufferAttribute(instanceIds, 1));
    return geo;
  }, [colors, instanceIds]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (!isVisible || !meshRef.current || !lodMeshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    uniforms.uTime.value = time;
    const cursor = getLerpedCursor(0.1);
    const camPos = state.camera.position;

    boids.forEach((boid, i) => {
      boid.update(boids, bounds, cursor, foodRef?.current || []);
      
      const dist = _v1.copy(boid.position).distanceTo(camPos);
      dummy.position.copy(boid.position);
      const s = i < 3 ? 1.8 : 1.0;
      dummy.scale.set(s, s, s);

      if (dist < LOD_DISTANCE) {
        // High-Poly Update
        if (boid.velocity.lengthSq() > 0.0001) {
          dummy.lookAt(boid.position.x + boid.velocity.x, boid.position.y + boid.velocity.y, boid.position.z + boid.velocity.z);
        }
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        // Hide Low-Poly
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        lodMeshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        // Low-Poly Update (Billboard)
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.updateMatrix();
        lodMeshRef.current.setMatrixAt(i, dummy.matrix);
        // Hide High-Poly
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    lodMeshRef.current.instanceMatrix.needsUpdate = true;
    
    // Invalidate to trigger re-render on demand if needed
    invalidate();
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      lodGeometry.dispose();
    };
  }, [geometry, lodGeometry]);

  return (
    <group ref={groupRef}>
      <instancedMesh key={`hp-${count}`} ref={meshRef} args={[geometry, null, count]} frustumCulled={false}>
        <shaderMaterial vertexShader={fishVert} fragmentShader={fishFrag} uniforms={uniforms} transparent />
      </instancedMesh>
      <instancedMesh key={`lp-${count}`} ref={lodMeshRef} args={[lodGeometry, null, count]} frustumCulled={false}>
        <shaderMaterial vertexShader={fishVert} fragmentShader={fishFrag} uniforms={uniforms} transparent />
      </instancedMesh>
    </group>
  );
};

export default FishMesh;

