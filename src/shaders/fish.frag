precision highp float;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 color = vColor;
    
    // Fake lighting / Shimmer
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Light from above
    vec3 lightDir = normalize(vec3(0.0, 1.0, 0.5));
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Specular shimmer
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    
    // Combine
    color = color * (0.6 + 0.4 * diff) + vec3(0.5) * spec;
    
    // Gradient based on UV for some depth
    color *= mix(0.8, 1.0, vUv.y);
    
    gl_FragColor = vec4(color, 1.0);
}
