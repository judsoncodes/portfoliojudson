precision highp float;

varying vec2 vUv;
varying float vElevation;
uniform float uTime;

void main() {
    vUv = uv;
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Wave displacement for the plane
    float elevation = sin(modelPosition.x * 0.5 + uTime) * 
                      cos(modelPosition.z * 0.5 + uTime * 0.5) * 0.5;
    
    modelPosition.y += elevation;
    vElevation = elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
}
