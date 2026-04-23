import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import disposalManager from '../utils/DisposalManager';

/**
 * ABYSSAL GARDEN
 * A collection of legendary glowing flora on the deep-sea floor.
 * Includes Pulsing Anemones and Swaying Void Kelp.
 */

const AbyssalGarden = () => {
  const anemoneRef = useRef();
  const kelpRef = useRef();
  
  const count = 40;
  
  // 1. ANEMONE DATA
  const anemones = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        pos: [(Math.random() - 0.5) * 60, -12, (Math.random() - 0.5) * 60],
        scale: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        color: new THREE.Color().setHSL(0.45 + Math.random() * 0.1, 1, 0.5)
      });
    }
    return data;
  }, []);

  // 2. KELP DATA
  const kelpCount = 30;
  const kelpData = useMemo(() => {
    const data = [];
    for (let i = 0; i < kelpCount; i++) {
      data.push({
        pos: [(Math.random() - 0.5) * 80, -12, (Math.random() - 0.5) * 80],
        scale: [0.5 + Math.random(), 4 + Math.random() * 8, 1],
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random()
      });
    }
    return data;
  }, []);

  const anemoneGeo = useMemo(() => disposalManager.track(new THREE.SphereGeometry(0.3, 16, 16)), []);
  const kelpGeo = useMemo(() => disposalManager.track(new THREE.PlaneGeometry(0.4, 1, 1, 10)), []);

  const dummy = new THREE.Object3D();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Update Anemones
    if (anemoneRef.current) {
      anemones.forEach((a, i) => {
        const pulse = 1 + Math.sin(t * 1.5 + a.phase) * 0.15;
        dummy.position.set(...a.pos);
        dummy.scale.set(a.scale * pulse, a.scale * pulse, a.scale * pulse);
        dummy.updateMatrix();
        anemoneRef.current.setMatrixAt(i, dummy.matrix);
      });
      anemoneRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Kelp
    if (kelpRef.current) {
      kelpData.forEach((k, i) => {
        dummy.position.set(...k.pos);
        dummy.scale.set(...k.scale);
        dummy.rotation.x = Math.sin(t * k.speed + k.phase) * 0.2;
        dummy.rotation.z = Math.cos(t * k.speed * 0.8 + k.phase) * 0.15;
        dummy.updateMatrix();
        kelpRef.current.setMatrixAt(i, dummy.matrix);
      });
      kelpRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="AbyssalGarden">
      {/* Pulsing Anemone Bases */}
      <instancedMesh ref={anemoneRef} args={[anemoneGeo, null, count]}>
        <meshStandardMaterial 
          emissive="#00ffcc" 
          emissiveIntensity={10} 
          toneMapped={false}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {/* Swaying Void Kelp */}
      <instancedMesh ref={kelpRef} args={[kelpGeo, null, kelpCount]}>
        <meshBasicMaterial 
          color="#002233" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
        />
      </instancedMesh>
    </group>
  );
};

export default AbyssalGarden;
