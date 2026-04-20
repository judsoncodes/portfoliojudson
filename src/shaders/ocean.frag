precision highp float;

varying vec2 vUv;
varying float vElevation;

uniform float uTime;
uniform float uDepthProgress;
uniform vec3 uColorTop;
uniform vec3 uColorBottom;

void main() {
    float wave = sin(vUv.x * 5.0 + uTime) * 0.5 + 0.5;
    float elevationFactor = vElevation * 1.5 + 0.5;
    
    vec3 color = mix(uColorBottom, uColorTop, clamp(elevationFactor + wave * 0.3, 0.0, 1.0));
    
    // Depth darkening
    color *= (1.0 - uDepthProgress * 0.6);

    gl_FragColor = vec4(color, 0.9);
}
