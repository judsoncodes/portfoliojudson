import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import fishVert from '../shaders/fish.vert';
import fishFrag from '../shaders/fish.frag';

// Spanning swarm settings
const COUNT = 100; 
const RADIUS_CONSTRAINT = 20;
const HERO_COUNT = 10;

// Vector pooling for 60fps performance
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const _v5 = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _targetQuat = new THREE.Quaternion();

const FishSystem = () => {
  const meshRef = useRef();
  const { mouse, camera } = useThree();
  
  // 1. Detailed Anatomy (Body + Fins)
  const geometry = useMemo(() => {
    // Body: Sleek curved sphere
    const bodyGeo = new THREE.SphereGeometry(0.2, 16, 16);
    bodyGeo.scale(0.5, 1.2, 2.8);
    
    // Tail Fins (Dual)
    const tailTop = new THREE.ConeGeometry(0.1, 0.8, 3);
    tailTop.rotateX(Math.PI / 2);
    tailTop.rotateZ(Math.PI / 5);
    tailTop.translate(0, 0.25, -0.8);
    
    const tailBottom = tailTop.clone();
    tailBottom.rotateZ(Math.PI / 1.6);
    tailBottom.translate(0, -0.5, 0);

    // Side Fins
    const sideFinL = new THREE.ConeGeometry(0.04, 0.5, 3);
    sideFinL.rotateZ(Math.PI / 3);
    sideFinL.translate(-0.2, 0, 0.3);
    
    const sideFinR = sideFinL.clone();
    sideFinR.scale(-1, 1, 1);
    sideFinR.translate(0.4, 0, 0);

    const merged = mergeGeometries([bodyGeo, tailTop, tailBottom, sideFinL, sideFinR]);
    
    // Shader Attributes
    const ids = new Float32Array(COUNT);
    const colors = new Float32Array(COUNT * 3);
    const palette = ['#4fc3f7', '#29b6f6', '#039be5', '#0288d1', '#ffa040'];
    const color = new THREE.Color();
    
    for (let i = 0; i < COUNT; i++) {
      ids[i] = i;
      color.set(palette[i % palette.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    merged.setAttribute('aInstanceId', new THREE.InstancedBufferAttribute(ids, 1));
    merged.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    
    return merged;
  }, []);

  // 2. Physics Initialization
  const fishData = useMemo(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      const isHero = i < HERO_COUNT;
      const speedMult = 0.7 + Math.random() * 0.6;
      data.push({
        position: new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * RADIUS_CONSTRAINT),
        velocity: new THREE.Vector3().randomDirection().multiplyScalar(0.02),
        acceleration: new THREE.Vector3(),
        maxSpeed: 0.05 * speedMult,
        maxForce: 0.003,
        scale: isHero ? 1.4 : 0.7,
      });
    }
    return data;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    uniforms.uTime.value = time;

    // Mouse evasion logic
    _v1.set(mouse.x, mouse.y, 0.5).unproject(camera);
    _v2.copy(camera.position);
    _v3.copy(_v1).sub(_v2).normalize();
    const distanceToZ = -camera.position.z / _v3.z;
    const cursorWorld = _v5.copy(camera.position).add(_v3.multiplyScalar(distanceToZ));

    fishData.forEach((f, i) => {
      // --- Spanning Swarm Physics ---
      const sep = _v1.set(0, 0, 0);
      const ali = _v2.set(0, 0, 0);
      const coh = _v3.set(0, 0, 0);
      let neighbors = 0;

      fishData.forEach((other, j) => {
        if (i === j) return;
        const d = f.position.distanceTo(other.position);
        if (d < 4.0) { // Larger perception for spanning swarm
          if (d < 1.5) {
            _v4.copy(f.position).sub(other.position).normalize().divideScalar(d);
            sep.add(_v4);
          }
          ali.add(other.velocity);
          coh.add(other.position);
          neighbors++;
        }
      });

      if (neighbors > 0) {
        sep.divideScalar(neighbors).setLength(f.maxSpeed).sub(f.velocity).clampLength(0, f.maxForce);
        ali.divideScalar(neighbors).setLength(f.maxSpeed).sub(f.velocity).clampLength(0, f.maxForce);
        coh.divideScalar(neighbors).sub(f.position).setLength(f.maxSpeed).sub(f.velocity).clampLength(0, f.maxForce);
        f.acceleration.add(sep.multiplyScalar(1.8)); // Stronger separation
        f.acceleration.add(ali.multiplyScalar(0.8));
        f.acceleration.add(coh.multiplyScalar(0.8));
      }

      // Cursor Flee
      if (f.position.distanceTo(cursorWorld) < 3.0) {
        _v4.copy(f.position).sub(cursorWorld).normalize().setLength(f.maxSpeed * 2.5).sub(f.velocity).clampLength(0, f.maxForce * 12);
        f.acceleration.add(_v4);
      }

      // Spanning Constraint (Origin attraction)
      const dist = f.position.length();
      if (dist > RADIUS_CONSTRAINT) {
        _v4.copy(f.position).negate().normalize().setLength(f.maxSpeed).sub(f.velocity).clampLength(0, f.maxForce * 5);
        f.acceleration.add(_v4);
      }

      // Update State
      f.velocity.add(f.acceleration);
      f.velocity.clampLength(0, f.maxSpeed);
      f.position.add(f.velocity);
      f.acceleration.set(0, 0, 0);

      // --- Rendering Transform ---
      _dummy.position.copy(f.position);
      if (f.velocity.lengthSq() > 0.0001) {
        _v4.copy(f.position).add(f.velocity);
        _dummy.lookAt(_v4);
        _targetQuat.copy(_dummy.quaternion);
        _dummy.quaternion.slerp(_targetQuat, 0.15); // Smooth orientation
      }
      _dummy.scale.setScalar(f.scale);
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, null, COUNT]} frustumCulled={false}>
      <shaderMaterial
        vertexShader={fishVert}
        fragmentShader={fishFrag}
        uniforms={uniforms}
        transparent
      />
    </instancedMesh>
  );
};

export default FishSystem;
