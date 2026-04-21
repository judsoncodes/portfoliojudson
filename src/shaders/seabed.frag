precision highp float;

varying vec2 vUv;
varying float vElevation;
uniform float uTime;
uniform float uScrollProgress;

void main() {
    // Base Colors
    vec3 ridgeColor = vec3(0.78, 0.66, 0.43); // #c8a96e
    vec3 valleyColor = vec3(0.54, 0.41, 0.23); // #8a6a3a
    
    // Mix based on elevation
    float mixFactor = smoothstep(-2.0, 2.0, vElevation);
    vec3 color = mix(valleyColor, ridgeColor, mixFactor);
    
    // Caustic Overlay
    vec2 p = vUv * 15.0;
    vec2 i = vec2(p);
    float c = 1.0;
    float inten = 0.05;
    for (int n = 0; n < 5; n++) {
        float t = uTime * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
    }
    c /= 5.0;
    c = 1.17 - pow(c, 1.4);
    vec3 caustics = vec3(pow(abs(c), 8.0));
    color += caustics * 0.15; // Subtle caustics
    
    // Fade in based on scroll progress (Prompt 26: fades in when > 0.7)
    float alpha = smoothstep(0.7, 0.85, uScrollProgress);
    
    gl_FragColor = vec4(color, alpha);
}
