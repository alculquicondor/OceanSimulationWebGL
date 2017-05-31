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
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    vec3 n = normalize(normal_camera);
    vec3 l = normalize(lightDirection_camera);

    vec3 ambientColor = materialColor * vec3(0.1, 0.1, 0.1);
    ambientColor = vec3(0, 0, 0);

    float cosTheta = dot(n, l);
    if (cosTheta < 0.0) {
        cosTheta = 0.0;
    }
    vec3 diffuseColor = materialColor * lightColor * cosTheta;

    vec3 e = normalize(eyeDirection_camera);
    vec3 r = reflect(-l, n);
    float cosAlpha = dot(e, r);
    if (cosAlpha < 0.0) {
        cosAlpha = 0.0;
    }
    vec3 specularColor = materialColor * lightColor * pow(cosAlpha, 5.0);

    vec3 color = ambientColor + diffuseColor + specularColor;

    float strenght = 1.0 - pow(clamp(length(UV - vec2(0.5, 0.5)) * 2.0, 0.0, 1.0), 6.0);
    vec3 bgColor = vec3(0.53, 0.81, 0.98);
    gl_FragColor = vec4(color * strenght + bgColor * (1.0 - strenght), 1.0);
}
