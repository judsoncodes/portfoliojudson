import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../context/ScrollContext';
import disposalManager from '../utils/DisposalManager';

const KelpStrand = ({ startPos, index, uScrollProgress }) => {
  const meshRef = useRef();
  const geoRef = useRef();
  const frondsGroupRef = useRef();
  
  const uTime = useRef({ value: 0 });

  // 12 Control Points for simulation
  const points = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      position: new THREE.Vector3(startPos[0], startPos[1] + i * 0.4, startPos[2]),
      velocity: new THREE.Vector3(0, 0, 0)
    }));
  }, [startPos]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    uTime.current.value = t;
    
    // 1. Physics Simulation for each free point (1-11)
    for (let i = 1; i < 12; i++) {
      const p = points[i];
      const prev = points[i - 1];

      // Spring force - very weak to allow slow settling
      const springForce = prev.position.clone().sub(p.position).multiplyScalar(0.05);
      
      // Upward buoyancy - minimal
      const buoyancy = new THREE.Vector3(0, 0.001 + Math.sin(t * 0.05 + index) * 0.0002, 0);
      
      // Current - almost static drift
      const current = new THREE.Vector3(
        Math.sin(t * 0.02 + i * 0.1 + index) * 0.0002,
        0,
        Math.cos(t * 0.02 + i * 0.05 + index) * 0.0001
      );

      p.velocity.add(springForce).add(buoyancy).add(current);
      p.velocity.multiplyScalar(0.98); // Extreme damping for ultra-slow motion
      p.position.add(p.velocity);

      // Distance constraint
      const dist = p.position.distanceTo(prev.position);
      if (dist > 0.42) {
        const dir = p.position.clone().sub(prev.position).normalize();
        p.position.copy(prev.position).addScaledVector(dir, 0.42);
      }
    }

    // 2. Rebuild Geometry
    const curve = new THREE.CatmullRomCurve3(points.map(p => p.position));
    const newGeo = new THREE.TubeGeometry(curve, 40, 0.04, 6, false);
    
    if (geoRef.current) geoRef.current.dispose();
    geoRef.current = newGeo;
    if (meshRef.current) meshRef.current.geometry = newGeo;

    // 3. Update Fronds
    if (frondsGroupRef.current) {
      const fronds = frondsGroupRef.current.children;
      let frondIdx = 0;
      const up = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i <= 40; i += 4) {
        if (frondIdx >= fronds.length) break;
        const frond = fronds[frondIdx];
        const u = i / 40;
        const pos = curve.getPoint(u);
        const tangent = curve.getTangent(u);
        frond.position.copy(pos);
        const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
        const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
        const matrix = new THREE.Matrix4().makeBasis(normal, tangent, binormal);
        frond.quaternion.setFromRotationMatrix(matrix);
        frondIdx++;
      }
    }
  });

  const frondActualGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.05, 0.1, 0.15, 0, 0.2);
    shape.bezierCurveTo(-0.1, 0.15, -0.1, 0.05, 0, 0);
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    return disposalManager.track(geo);
  }, []);

  const stemMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uScrollProgress },
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uScrollProgress;
      void main() {
        vec3 base = vec3(0.05, 0.2, 0.05);
        vec3 tip = vec3(0.2, 0.5, 0.1);
        vec3 color = mix(base, tip, vUv.y);
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [uScrollProgress]);

  const frondMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uScrollProgress },
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uScrollProgress;
      void main() {
        float alpha = smoothstep(0.3, 0.9, uScrollProgress);
        gl_FragColor = vec4(0.1, 0.3, 0.1, alpha);
      }
    `
  }), [uScrollProgress]);

  return (
    <group>
      <mesh ref={meshRef} material={stemMat} />
      <group ref={frondsGroupRef}>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} geometry={frondActualGeo} material={frondMat} />
        ))}
      </group>
    </group>
  );
};

const KelpForest = () => {
  const { progress } = useScroll();
  const groupRef = useRef();
  const uScrollProgress = useRef({ value: 0 });

  useFrame(() => {
    uScrollProgress.current.value = progress.current;
    if (groupRef.current) {
      groupRef.current.visible = progress.current > 0.25;
    }
  });
  
  const strands = useMemo(() => {
    const arr = [];
    const clusters = [
      { x: [-14, -10], z: [-12, 12] },
      { x: [10, 14], z: [-12, 12] },
      { x: [-14, 14], z: [-12, -9] },
      { x: [-14, 14], z: [9, 12] }
    ];

    for (let i = 0; i < 45; i++) {
      const cluster = clusters[i % 4];
      const x = THREE.MathUtils.randFloat(cluster.x[0], cluster.x[1]);
      const z = THREE.MathUtils.randFloat(cluster.z[0], cluster.z[1]);
      arr.push([x, -12, z]);
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef} name="KelpForest">
      {strands.map((pos, i) => (
        <KelpStrand key={i} index={i} startPos={pos} uScrollProgress={uScrollProgress.current} />
      ))}
    </group>
  );
};

export default KelpForest;
