precision highp float;

varying vec2 vUv;
uniform float uProgress;
uniform vec3 uColor;

void main() {
    // Stylized wave front
    // Adding a sin wave to the X-axis progress to create a "wavy" leading edge
    float waveEdge = vUv.x - (uProgress * 1.2 - 0.1); // Offset to ensure it covers start/end
    
    // Add sinusoidal distortion to the edge
    waveEdge += sin(vUv.y * 12.0) * 0.03;
    waveEdge += sin(vUv.y * 25.0) * 0.01;

    // Discard pixels ahead of the wave front
    if (waveEdge > 0.0) {
        discard;
    }

    // Smooth gradient at the very edge of the wave for a "soft" feel
    float alpha = smoothstep(0.0, -0.05, waveEdge);
    
    // Add a highlight at the leading edge
    vec3 finalColor = uColor;
    float edgeHighlight = smoothstep(-0.02, 0.0, waveEdge) * smoothstep(0.0, -0.02, waveEdge);
    finalColor += edgeHighlight * 0.4;

    gl_FragColor = vec4(finalColor, alpha);
}
