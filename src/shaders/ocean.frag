precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uDepthProgress;

// Zone Palettes
uniform vec3 uSunlitTop;
uniform vec3 uSunlitBottom;
uniform vec3 uTwilightTop;
uniform vec3 uTwilightBottom;
uniform vec3 uAbyssalTop;
uniform vec3 uAbyssalBottom;

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
    // Normalize position Y for gradient (-100 to 100 on sphere)
    float normalizedY = (vPosition.y + 100.0) / 200.0;
    
    // Liquid caustics shimmer
    float caustics = getCaustics(vUv * 4.0, uTime * 0.3);
    
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

    vec3 color = mix(zoneBottom, zoneTop, clamp(normalizedY + caustics * 0.2, 0.0, 1.0));
    
    // Subtle god-ray stripes (fade out as we go deeper)
    float rays = sin(vUv.x * 20.0 + uTime * 0.1) * 0.03 * normalizedY;
    color += rays * (1.0 - uDepthProgress);

    gl_FragColor = vec4(color, 1.0);
}
