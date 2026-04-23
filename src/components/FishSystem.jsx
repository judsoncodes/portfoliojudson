import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FISH_COUNT = 50; // Increased for density
const BOUND_RADIUS = 12.0;

// Reusable objects for performance
const _dummy = new THREE.Object3D();
const _forward = new THREE.Vector3(0, 0, 1);
const _targetQ = new THREE.Quaternion();
const _velNorm = new THREE.Vector3();
const _diff = new THREE.Vector3();
const _sep = new THREE.Vector3();
const _ali = new THREE.Vector3();
const _coh = new THREE.Vector3();

export default function FishSystem() {
  const meshRef = useRef();
  const boidsRef = useRef([]);
  const cursorWorld = useRef(new THREE.Vector3(0, 0, 0));
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
       0.00,  0.00,  0.50, 
       0.00,  0.06,  0.32, 0.08,  0.02,  0.32, 0.00, -0.04,  0.32, -0.08,  0.02,  0.32,
       0.00,  0.10,  0.05, 0.13,  0.03,  0.05, 0.00, -0.07,  0.05, -0.13,  0.03,  0.05,
       0.00,  0.05, -0.30, 0.06,  0.01, -0.30, 0.00, -0.03, -0.30, -0.06,  0.01, -0.30,
       0.00,  0.28, -0.52, 0.00,  0.08, -0.40, 0.00, -0.08, -0.40, 0.00, -0.28, -0.52,
       0.00,  0.28, -0.05, 0.00,  0.10,  0.15, 0.00,  0.10, -0.20,
      -0.32,  0.00,  0.10, -0.13,  0.03,  0.18, -0.13,  0.03, -0.05,
       0.32,  0.00,  0.10,  0.13,  0.03,  0.18,  0.13,  0.03, -0.05,
    ]);
    const indices = new Uint16Array([
      0,1,2, 0,2,3, 0,3,4, 0,4,1, 1,5,6, 1,6,2, 2,6,7, 2,7,3, 3,7,8, 3,8,4, 4,8,5, 4,5,1,
      5,9,10, 5,10,6, 6,10,11, 6,11,7, 7,11,12, 7,12,8, 8,12,9, 8,9,5,
      9,13,14, 10,14,13, 11,15,16, 12,16,15, 14,15,10, 17,18,19, 20,21,22, 23,24,25,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new THREE.MeshPhongMaterial({ color: 0x4fc3f7, specular: 0x88ccff, shininess: 100, emissive: 0x051a2a, side: THREE.DoubleSide });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      mat.userData.shader = shader;
      shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        float iid = float(gl_InstanceID);
        float phase = iid * 0.73;
        float tail = clamp(-transformed.z * 2.0, 0.0, 1.0);
        transformed.x += sin(uTime * 7.0 + phase) * 0.35 * tail;
        transformed.x += sin(transformed.z * 2.5 + uTime * 7.0 + phase) * 0.08 * (1.0 - tail);
      `);
    };
    return mat;
  }, []);

  const resetBoid = (boid) => {
    const side = Math.random() > 0.5 ? 1 : -1;
    boid.pos.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10, -15); // Start from background
    boid.vel.set((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.02, 0.05 + Math.random() * 0.1);
    boid.acc.set(0, 0, 0);
    boid.life = 0;
    boid.maxLife = 500 + Math.random() * 500;
  };

  useEffect(() => {
    boidsRef.current = Array.from({ length: FISH_COUNT }, (_, i) => {
      const b = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), acc: new THREE.Vector3(), maxSpeed: 0.04 + Math.random() * 0.03, groupId: i % 3 };
      resetBoid(b);
      // Randomize start positions across the volume
      b.pos.z = (Math.random() - 0.5) * 25;
      return b;
    });

    if (meshRef.current) {
      const colors = [new THREE.Color(0x4fc3f7), new THREE.Color(0x00f2ff), new THREE.Color(0xffaa00)];
      for (let i = 0; i < FISH_COUNT; i++) {
        meshRef.current.setColorAt(i, colors[i % 3]);
      }
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, []);

  useEffect(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, cursorWorld.current);
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [camera]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (material.userData.shader) material.userData.shader.uniforms.uTime.value = t;

    const boids = boidsRef.current;
    const MAX_FORCE = 0.0025;
    const SEP_R_SQ = 1.44;
    const ALI_R_SQ = 9.0;
    const COH_R_SQ = 16.0;

    boids.forEach((boid, i) => {
      _sep.set(0, 0, 0); _ali.set(0, 0, 0); _coh.set(0, 0, 0);
      let sc = 0, ac = 0, cc = 0;

      // Optimized proximity check
      for (let j = 0; j < boids.length; j++) {
        if (i === j) continue;
        const dSq = boid.pos.distanceToSquared(boids[j].pos);
        if (dSq < SEP_R_SQ) { _diff.subVectors(boid.pos, boids[j].pos).divideScalar(Math.max(0.1, dSq)); _sep.add(_diff); sc++; }
        if (boid.groupId === boids[j].groupId) {
          if (dSq < ALI_R_SQ) { _ali.add(boids[j].vel); ac++; }
          if (dSq < COH_R_SQ) { _coh.add(boids[j].pos); cc++; }
        }
      }

      if (sc > 0) { _sep.normalize().multiplyScalar(MAX_FORCE * 2.0); boid.acc.add(_sep); }
      if (ac > 0) { _ali.normalize().multiplyScalar(MAX_FORCE); boid.acc.add(_ali); }
      if (cc > 0) { _coh.divideScalar(cc).sub(boid.pos).normalize().multiplyScalar(MAX_FORCE * 1.2); boid.acc.add(_coh); }

      // Cursor Avoidance
      const cdSq = boid.pos.distanceToSquared(cursorWorld.current);
      if (cdSq < 16.0) { _diff.subVectors(boid.pos, cursorWorld.current).normalize().multiplyScalar(MAX_FORCE * 10.0 / (Math.sqrt(cdSq) + 0.1)); boid.acc.add(_diff); }

      // Constant swimming force
      _forward.set(0,0,1).applyQuaternion(_targetQ.setFromUnitVectors(new THREE.Vector3(0,0,1), _velNorm.copy(boid.vel).normalize()));
      boid.acc.add(_forward.multiplyScalar(0.0005));

      // Physics Integration
      boid.vel.add(boid.acc);
      if (boid.vel.length() > boid.maxSpeed) boid.vel.normalize().multiplyScalar(boid.maxSpeed);
      boid.pos.add(boid.vel);
      boid.acc.set(0, 0, 0);

      // "Spawning" / Recycling logic
      boid.life++;
      const outOfBounds = Math.abs(boid.pos.x) > 25 || Math.abs(boid.pos.y) > 15 || boid.pos.z > 20 || boid.pos.z < -25;
      if (boid.life > boid.maxLife || outOfBounds) {
        resetBoid(boid);
      }

      // Update Instance
      _dummy.position.copy(boid.pos);
      if (boid.vel.lengthSq() > 0.0001) {
        _velNorm.copy(boid.vel).normalize();
        _targetQ.setFromUnitVectors(new THREE.Vector3(0,0,1), _velNorm);
        _dummy.quaternion.slerp(_targetQ, 0.15); // Smooth orientation
      }
      _dummy.rotation.x += boid.vel.y * -3;
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, FISH_COUNT]} frustumCulled={false} />
  );
}
