varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vColor;

uniform float uTime;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel effect for iridescence
    float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);
    
    // Bioluminescent pulse
    float pulse = sin(uTime * 2.0 + vViewPosition.z * 0.1) * 0.5 + 0.5;
    
    // Base color from instance attribute
    vec3 baseColor = vColor;
    
    // Iridescent colors (cycling based on time and fresnel)
    vec3 iridColor = 0.5 + 0.5 * cos(uTime + vec3(0, 2, 4) + fresnel * 5.0);
    
    // Combine
    vec3 finalColor = mix(baseColor, iridColor, fresnel);
    
    // Add glowing spots
    float glow = smoothstep(0.45, 0.5, sin(vUv.y * 20.0 + uTime)) * 0.2;
    finalColor += vColor * glow * pulse;
    
    // Subtle rim light
    finalColor += vec3(0.5, 0.8, 1.0) * pow(fresnel, 5.0) * 2.0;

    gl_FragColor = vec4(finalColor, 1.0);
}
