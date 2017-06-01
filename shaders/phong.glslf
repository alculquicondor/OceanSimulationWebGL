precision mediump float;

varying vec2 UV;
varying vec3 normal_camera;
varying vec3 lightDirection_camera;
varying vec3 eyeDirection_camera;

float pow(float b, int t) {
    float r = b;
    for (int i = 1; i < t; i++) {
        r *= b;
    }
    return r;
}

void main() {
    vec3 materialColor = vec3(0.11, 0.42, 0.63);
    vec3 diffuseLightColor = vec3(0.5, 0.5, 0.5);
    vec3 specularLightColor = vec3(0.4, 0.4, 0.4);

    vec3 n = normalize(normal_camera);
    vec3 l = normalize(lightDirection_camera);

    vec3 ambientColor = materialColor * vec3(0.5, 0.5, 0.5);

    float cosTheta = clamp(dot(n, l), 0.0, 1.0);
    vec3 diffuseColor = materialColor * diffuseLightColor * cosTheta;

    vec3 e = normalize(eyeDirection_camera);
    vec3 r = reflect(-l, n);
    float cosAlpha = clamp(dot(e, r), 0.0, 1.0);
    vec3 specularColor = materialColor * specularLightColor * pow(cosAlpha, 10.0);

    vec3 color = ambientColor + diffuseColor + specularColor;

    float strenght = 1.0 - pow(clamp(length(UV - vec2(0.5, 0.5)) * 2.0, 0.0, 1.0), 6.0);
    vec3 bgColor = vec3(0.53, 0.81, 0.98);
    gl_FragColor = vec4(color * strenght + bgColor * (1.0 - strenght), 1.0);
}
