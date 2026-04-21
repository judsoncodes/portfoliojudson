precision highp float;

varying vec2 vUv;
varying float vElevation;

uniform float uTime;
uniform float uDepthProgress;

// Zone Palettes
uniform vec3 uSunlitTop;
uniform vec3 uSunlitBottom;
uniform vec3 uTwilightTop;
uniform vec3 uTwilightBottom;
uniform vec3 uAbyssalTop;
uniform vec3 uAbyssalBottom;

// High-end liquid caustic function
float getCaustics(vec2 uv, float t) {
    vec2 p = mod(uv * 6.2831, 6.2831) - 250.0;
    vec2 i = vec2(p);
    float c = 1.0;
    float intentity = 0.005;

    for (int n = 0; n < 5; n++) {
        float t_val = t * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(t_val - i.x) + sin(t_val + i.y), sin(t_val - i.y) + cos(t_val + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + t_val) / intentity), p.y / (cos(i.y + t_val) / intentity)));
    }
    c /= 5.0;
    c = 1.17 - pow(c, 1.4);
    float val = pow(abs(c), 8.0);
    return clamp(val, 0.0, 0.5);
}

void main() {
    float wave = sin(vUv.x * 5.0 + uTime) * 0.5 + 0.5;
    float elevationFactor = vElevation * 1.5 + 0.5;
    
    // Liquid caustics shimmer
    float caustics = getCaustics(vUv * 2.0, uTime * 0.5);
    
    // Zone Color Computation
    vec3 zoneTop;
    vec3 zoneBottom;
    
    if(uDepthProgress < 0.33) {
        float t = clamp(uDepthProgress / 0.33, 0.0, 1.0);
        zoneTop = mix(uSunlitTop, uTwilightTop, t);
        zoneBottom = mix(uSunlitBottom, uTwilightBottom, t);
    } else if(uDepthProgress < 0.66) {
        float t = clamp((uDepthProgress - 0.33) / 0.33, 0.0, 1.0);
        zoneTop = mix(uTwilightTop, uAbyssalTop, t);
        zoneBottom = mix(uTwilightBottom, uAbyssalBottom, t);
    } else {
        zoneTop = uAbyssalTop;
        zoneBottom = uAbyssalBottom;
    }

    vec3 color = mix(zoneBottom, zoneTop, clamp(elevationFactor + wave * 0.2 + caustics, 0.0, 1.0));
    
    // Add subtle god-ray stripes (fade out as we go deeper)
    float rays = sin(vUv.x * 10.0 + uTime * 0.2) * 0.05 * (1.0 - vUv.y);
    color += rays * (1.0 - uDepthProgress);

    gl_FragColor = vec4(color, 0.9);
}
