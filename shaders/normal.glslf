precision mediump float;

varying vec2 UV;
varying vec3 lightDirection_tangent;
varying vec3 eyeDirection_tangent;

uniform sampler2D normalTex;
uniform float time;

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
    vec3 specularLightColor = vec3(0.5, 0.5, 0.5);

    float delta = time * 0.02;
    vec3 n = normalize(texture2D(normalTex,
                               UV * 40.0 + 10.0 * vec2(sin(delta), cos(delta))).rgb * 2.0 - 1.0);
    vec3 l = normalize(lightDirection_tangent);

    vec3 ambientColor = materialColor * vec3(0.5, 0.5, 0.5);

    float cosTheta = clamp(dot(n, l), 0.0, 1.0);
    vec3 diffuseColor = materialColor * diffuseLightColor * cosTheta;

    vec3 e = normalize(eyeDirection_tangent);
    vec3 r = reflect(-l, n);
    float cosAlpha = clamp(dot(e, r), 0.0, 1.0);
    vec3 specularColor = materialColor * specularLightColor * pow(cosAlpha, 10.0);

    vec3 color = ambientColor + diffuseColor + specularColor;

    float strenght = 1.0 - pow(clamp(length(UV - vec2(0.5, 0.5)) * 2.0, 0.0, 1.0), 6.0);
    vec3 bgColor = vec3(0.53, 0.81, 0.98);
    gl_FragColor = vec4(color * strenght + bgColor * (1.0 - strenght), 1.0);
}

