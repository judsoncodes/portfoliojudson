import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MantaRay = () => {
  const groupRef = useRef();
  const tailRef = useRef();
  const matRef = useRef();

  // 1. Build the custom BufferGeometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top Surface (Dorsal)
       0.0,  0.08,  0.8,    // 0: nose
       0.0,  0.05,  0.0,    // 1: center
       0.0,  0.00, -0.6,    // 2: tail base
      -1.2,  0.00,  0.2,    // 3: left tip
      -0.7,  0.04,  0.5,    // 4: left mid-front
      -0.8,  0.00, -0.2,    // 5: left mid-back
       1.2,  0.00,  0.2,    // 6: right tip
       0.7,  0.04,  0.5,    // 7: right mid-front
       0.8,  0.00, -0.2,    // 8: right mid-back
      // Underside (Ventral) - offset Y
       0.0,  0.02,  0.8,    // 9: nose bottom
       0.0, -0.01,  0.0,    // 10: center bottom
       0.0, -0.06, -0.6,    // 11: tail base bottom
      -1.2, -0.06,  0.2,    // 12: left tip bottom
      -0.7, -0.02,  0.5,    // 13: left mid-front bottom
      -0.8, -0.06, -0.2,    // 14: left mid-back bottom
       1.2, -0.06,  0.2,    // 15: right tip bottom
       0.7, -0.02,  0.5,    // 16: right mid-front bottom
       0.8, -0.06, -0.2,    // 17: right mid-back bottom
    ]);

    const indices = [
      // Top Surface
      0, 4, 1,  0, 1, 7,  
      1, 4, 5,  1, 7, 8,
      1, 5, 2,  1, 8, 2,
      4, 3, 5,  7, 6, 8,
      // Bottom Surface (Reverse winding)
      9, 10, 13,  9, 16, 10,
      10, 14, 13, 10, 16, 17,
      10, 11, 14, 10, 17, 11,
      13, 14, 12, 16, 15, 17,
      // Edge Stitching
      0, 9, 13, 0, 13, 4,
      0, 16, 9, 0, 7, 16,
      4, 13, 12, 4, 12, 3,
      7, 15, 16, 7, 6, 15,
      3, 12, 14, 3, 14, 5,
      6, 17, 15, 6, 8, 17,
      5, 14, 11, 5, 11, 2,
      8, 11, 17, 8, 2, 11
    ];

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. Material with custom shader logic
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      matRef.current = shader;

      // Wing Undulation in Vertex Shader
      shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float wingFactor = abs(transformed.x) / 1.2;
        float wave = sin(transformed.z * 2.0 + uTime * 1.8) * wingFactor * 0.18;
        transformed.y += wave;
        `
      );

      // Dorsal/Ventral Coloring in Fragment Shader
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        if (gl_FrontFacing) {
          diffuseColor.rgb = vec3(0.10, 0.10, 0.18); // #1a1a2e (Dark Dorsal)
        } else {
          diffuseColor.rgb = vec3(0.87, 0.91, 0.94); // #dde8f0 (Pale Ventral)
        }
        `
      );
    };
    return mat;
  }, []);

  // 3. Whip Tail
  const tailPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 8; i++) {
      points.push(new THREE.Vector3(0, 0, -0.6 - i * 0.25));
    }
    return points;
  }, []);
  const tailCurve = useMemo(() => new THREE.CatmullRomCurve3(tailPoints), [tailPoints]);
  const tailGeo = useMemo(() => new THREE.TubeGeometry(tailCurve, 30, 0.018, 4), [tailCurve]);
  const tailMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a2e' }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (matRef.current) matRef.current.uniforms.uTime.value = t;

    // Flight Path
    const x = Math.sin(t * 0.08) * 7;
    const z = Math.cos(t * 0.08) * 5;
    const y = 1.5 + Math.sin(t * 0.15) * 1.2;

    const nextX = Math.sin((t + 0.1) * 0.08) * 7;
    const nextZ = Math.cos((t + 0.1) * 0.08) * 5;
    const nextY = 1.5 + Math.sin((t + 0.1) * 0.15) * 1.2;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      
      // Face velocity
      const vel = new THREE.Vector3(nextX - x, nextY - y, nextZ - z).normalize();
      const forward = new THREE.Vector3(0, 0, 1);
      groupRef.current.quaternion.setFromUnitVectors(forward, vel);
    }

    // Tail Sway
    if (tailRef.current) {
      const tipControl = tailPoints[tailPoints.length - 1];
      tipControl.x = Math.sin(t * 2.0) * 0.3;
      tailCurve.points = tailPoints;
      tailRef.current.geometry.dispose();
      tailRef.current.geometry = new THREE.TubeGeometry(tailCurve, 30, 0.018, 4);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} />
      <mesh ref={tailRef} geometry={tailGeo} material={tailMat} />
    </group>
  );
};

export default MantaRay;
