import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

const PULSE_DURATION = 1.2;
const LIT_DURATION = 1500;

/**
 * SonarPulse Component
 * Emits a biological sonar ring on long-press or right-click.
 * Illuminates "sonar-target" elements in the DOM.
 */
const SonarPulse = () => {
  const { camera, mouse } = useThree();
  const [pulses, setPulses] = useState([]);
  const longPressTimer = useRef(null);

  // Map to track active lit elements and their timeouts
  const litElements = useMemo(() => new WeakMap(), []);

  const triggerPulse = useCallback(() => {
    // Project mouse to world coordinates at Z=0
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));

    const id = Math.random().toString(36).substr(2, 9);
    setPulses((prev) => [...prev, { id, position: worldPos }]);

    // Dispatch global event for marine life to react
    window.dispatchEvent(new CustomEvent('sonar-ping', { 
      detail: { position: worldPos, radius: 8, strength: 1.5 } 
    }));

    // Sonar Query: Highlight DOM targets
    const targets = document.querySelectorAll('[data-sonar-target]');
    targets.forEach((el) => {
      el.classList.add('sonar-lit');
      
      // Clear existing timeout if any
      if (litElements.has(el)) {
        clearTimeout(litElements.get(el));
      }

      const timeout = setTimeout(() => {
        el.classList.remove('sonar-lit');
        litElements.delete(el);
      }, LIT_DURATION);

      litElements.set(el, timeout);
    });
  }, [camera, mouse, litElements]);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerPulse();
    };

    const handlePointerDown = () => {
      longPressTimer.current = setTimeout(() => {
        triggerPulse();
      }, 500);
    };

    const handlePointerUp = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [triggerPulse]);

  const removePulse = (id) => {
    setPulses((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <group>
      {pulses.map((p) => (
        <PulseRing key={p.id} position={p.position} onComplete={() => removePulse(p.id)} />
      ))}
    </group>
  );
};

const PulseRing = ({ position, onComplete }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useEffect(() => {
    if (!meshRef.current) return;

    // Pulse Animation
    gsap.fromTo(
      meshRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 8, y: 8, z: 1, duration: PULSE_DURATION, ease: 'power2.out' }
    );

    gsap.fromTo(
      materialRef.current,
      { opacity: 1 },
      { 
        opacity: 0, 
        duration: PULSE_DURATION, 
        ease: 'power2.in',
        onComplete 
      }
    );
  }, [onComplete]);

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1, 0.02, 16, 64]} />
      <meshBasicMaterial 
        ref={materialRef} 
        color="#00ffff" 
        transparent 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </mesh>
  );
};

export default SonarPulse;
