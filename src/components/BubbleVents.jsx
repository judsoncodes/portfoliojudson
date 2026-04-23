import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const POOL_SIZE = 30;

const ventPositions = [
  new THREE.Vector3(-6, -12, 3),
  new THREE.Vector3(4, -12, -5),
  new THREE.Vector3(-2, -12, 8),
  new THREE.Vector3(8, -12, 1),
];

export default function BubbleVents() {
  const { scene } = useThree();
  const pool = useRef([]);
  const ventTimers = useRef([0, 0, 0, 0]);

  // ⚠️ TEMP DEBUG MATERIAL (VERY VISIBLE)
  const bubbleMaterial = new THREE.MeshBasicMaterial({
    color: "cyan",
    transparent: true,
    opacity: 0.8,
  });

  const rippleMat = new THREE.MeshBasicMaterial({
    color: "white",
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });

  useEffect(() => {
    console.log("🔥 Bubble system initialized");

    for (let i = 0; i < POOL_SIZE * 4; i++) {
      const size = 0.08; // 👈 BIGGER FOR DEBUG

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 6, 6),
        bubbleMaterial.clone()
      );

      const obj = {
        mesh,
        active: false,
        velocity: new THREE.Vector3(),
        baseSize: size,
        lifetime: 0,
        maxLifetime: 3 + Math.random() * 2,
        ventIndex: Math.floor(i / POOL_SIZE),
        wobbleOffset: Math.random() * Math.PI * 2,
      };

      pool.current.push(obj);
      scene.add(mesh);

      mesh.visible = false;
    }

    return () => {
      pool.current.forEach((b) => {
        if (b.mesh.geometry) b.mesh.geometry.dispose();
        if (b.mesh.material) b.mesh.material.dispose();
        scene.remove(b.mesh);
      });
    };
  }, [scene]);

  const spawnBubble = (ventPos, ventIndex) => {
    const bubble = pool.current.find(
      (b) => !b.active && b.ventIndex === ventIndex
    );
    if (!bubble) return;

    bubble.active = true;
    bubble.mesh.visible = true;

    bubble.mesh.position
      .copy(ventPos)
      .add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          0,
          (Math.random() - 0.5) * 0.5
        )
      );

    bubble.velocity.set(
      (Math.random() - 0.5) * 0.01,
      0.03, // 👈 MUCH FASTER FOR DEBUG
      (Math.random() - 0.5) * 0.01
    );

    bubble.lifetime = 0;
  };

  const spawnPopRipple = (pos) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.03, 6, 20),
      rippleMat.clone()
    );

    ring.position.copy(pos);
    ring.rotation.x = -Math.PI / 2;

    scene.add(ring);

    gsap.to(ring.scale, {
      x: 3,
      y: 3,
      z: 3,
      duration: 0.5,
    });

    gsap.to(ring.material, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        ring.geometry.dispose();
        ring.material.dispose();
        scene.remove(ring);
      },
    });
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    pool.current.forEach((bubble) => {
      if (!bubble.active) return;

      bubble.lifetime += delta;

      bubble.velocity.y += 0.001;

      bubble.mesh.position.add(bubble.velocity);

      // 👇 DEBUG: POP HIGHER
      if (
        bubble.mesh.position.y > 0 ||
        bubble.lifetime > bubble.maxLifetime
      ) {
        spawnPopRipple(bubble.mesh.position);

        bubble.active = false;
        bubble.mesh.visible = false;
      }
    });

    ventTimers.current.forEach((timer, vi) => {
      if (t - timer > 0.2) {
        spawnBubble(ventPositions[vi], vi);
        ventTimers.current[vi] = t;
      }
    });
  });

  return null;
}
