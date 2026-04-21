precision highp float;

attribute vec3 aColor;
attribute float aInstanceId;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float uTime;

void main() {
    vUv = uv;
    vColor = aColor;
    
    // Vertex displacement for organic fish wiggle
    vec3 pos = position;
    
    // Wiggle intensity based on Z position (tail wiggles more)
    float wiggleStrength = smoothstep(0.5, -1.0, pos.z) * 0.15;
    float wiggle = sin(uTime * 10.0 + aInstanceId * 3.0 + pos.z * 5.0) * wiggleStrength;
    pos.x += wiggle;
    
    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    
    vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    vViewPosition = -viewPosition.xyz;
    
    gl_Position = projectionMatrix * viewPosition;
}
