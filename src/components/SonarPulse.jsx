import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import disposalManager from '../utils/DisposalManager';

const PULSE_DURATION = 1.2;
const LIT_DURATION = 1500;

/**
 * SonarPulse Component
 * Emits a sonar ring on long-press or right-click as per Prompt 20 requirements.
 */
const SonarPulse = () => {
  const { camera, mouse } = useThree();
  const [pulses, setPulses] = useState([]);
  const longPressTimer = useRef(null);
  const litElements = useMemo(() => new WeakMap(), []);

  const triggerPulse = useCallback(() => {
    // Project mouse to world coordinates at Z=0
    const dir = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));

    const id = Math.random().toString(36).substr(2, 9);
    setPulses((prev) => [...prev, { id, position: worldPos }]);

    // Sonar Query: Highlight DOM targets
    const targets = document.querySelectorAll('[data-sonar-target]');
    targets.forEach((el) => {
      el.classList.add('sonar-lit');
      
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

    // Mobile: Two-finger long press detection
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        longPressTimer.current = setTimeout(() => {
          triggerPulse();
        }, 500);
      }
    };

    const handlePointerDown = (e) => {
      // Don't trigger on touch (handled by handleTouchStart for 2 fingers)
      if (e.pointerType === 'touch') return;
      
      longPressTimer.current = setTimeout(() => {
        triggerPulse();
      }, 500);
    };

    const handleRelease = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleRelease);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handleRelease);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleRelease);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handleRelease);
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
      <torusGeometry args={[1, 0.01, 16, 64]} />
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
