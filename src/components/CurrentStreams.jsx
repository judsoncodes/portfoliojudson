import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useVisibility from '../hooks/useVisibility';

const CurrentStreams = () => {
  const pointsCount = 1200;
  const streamsCount = 6;
  const particlesPerStream = pointsCount / streamsCount;

  const meshRef = useRef();
  const posAttrRef = useRef();
  const { invalidate } = useThree();
  const isVisible = useVisibility(meshRef);

  // Stream Definitions
  const curves = useMemo(() => {
    const streamPaths = [
      // Stream 1 — main horizontal current left to right mid-water (extended to 8 points)
      [[-25, 2, -3], [-20, 0, -2], [-12, 1, -1], [-4, 0.5, 0], [4, -0.5, 1], [12, 0.5, 0], [20, 1, -1], [25, 0, -2]],
      // Stream 2 — diagonal rising current (extended to 8 points)
      [[-20, -10, 4], [-15, -8, 3], [-8, -5, 1], [0, -3, 0], [8, -1, -1], [15, 1, -2], [22, 4, -3], [28, 6, -4]],
      // Stream 3 — seabed sand drift (extended to 8 points)
      [[-25, -11, 0], [-18, -11, 0], [-10, -11.5, 2], [0, -11, 1], [10, -11.5, -1], [18, -11, 0], [22, -11, 1], [28, -11, 0]],
    ];

    // Streams 4, 5, 6 — random variation (8 points each)
    for (let i = 0; i < 3; i++) {
      const path = [];
      const startX = -25;
      const startY = (Math.random() - 0.5) * 15;
      const startZ = (Math.random() - 0.5) * 10;
      for (let j = 0; j < 8; j++) {
        path.push([
          startX + j * 7,
          startY + (Math.random() - 0.5) * 4,
          startZ + (Math.random() - 0.5) * 4
        ]);
      }
      streamPaths.push(path);
    }

    return streamPaths.map(path => {
      const curvePoints = path.map(p => new THREE.Vector3(...p));
      return {
        curve: new THREE.CatmullRomCurve3(curvePoints),
        speed: 0.0008 + Math.random() * 0.0007 // 0.0008 to 0.0015
      };
    });
  }, []);

  const { positions, colors, streamIndices, tValues } = useMemo(() => {
    const pos = new Float32Array(pointsCount * 3);
    const cols = new Float32Array(pointsCount * 3);
    const indices = new Float32Array(pointsCount);
    const ts = new Float32Array(pointsCount);

    const colorMid = new THREE.Color('#88ffcc');
    const colorSeabed = new THREE.Color('#c8a96e');
    const colorDeep = new THREE.Color('#004488');

    for (let i = 0; i < pointsCount; i++) {
      const si = Math.floor(i / particlesPerStream);
      indices[i] = si;
      ts[i] = Math.random();

      // Set colors
      let color;
      if (si <= 1) color = colorMid;
      else if (si === 2) color = colorSeabed;
      else color = colorDeep;

      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      // Initial positions
      const pt = curves[si].curve.getPoint(ts[i]);
      pos[i * 3] = pt.x;
      pos[i * 3 + 1] = pt.y;
      pos[i * 3 + 2] = pt.z;
    }

    return { positions: pos, colors: cols, streamIndices: indices, tValues: ts };
  }, [curves, particlesPerStream]);

  useFrame((state) => {
    if (!isVisible || !posAttrRef.current) return;
    
    const t = state.clock.elapsedTime;
    const posAttr = posAttrRef.current;

    for (let i = 0; i < pointsCount; i++) {
      const si = streamIndices[i];
      const stream = curves[si];
      
      tValues[i] += stream.speed;
      if (tValues[i] > 1.0) tValues[i] = 0.0;

      // Add drift to the curve control points slowly (approximated by adding to final pos)
      const driftX = Math.sin(t * 0.1 + si * 1.3) * 0.5;
      const pt = stream.curve.getPoint(tValues[i]);

      posAttr.array[i * 3] = pt.x + driftX;
      posAttr.array[i * 3 + 1] = pt.y;
      posAttr.array[i * 3 + 2] = pt.z;
    }

    posAttr.needsUpdate = true;
    invalidate();
  });

  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
    };
  }, []);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          count={pointsCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={pointsCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

export default CurrentStreams;
