precision mediump float;

attribute vec3 vertexPosition;
attribute vec2 vertexUV;

uniform mat4 MVP;
uniform mat4 V;
uniform mat4 M;
uniform vec4 waves[20];
uniform float time;
uniform vec3 light_world;

varying vec3 lightDirection_tangent;
varying vec3 eyeDirection_tangent;
varying vec2 UV;

mat3 transpose(in mat3 inMatrix) {
    vec3 i0 = inMatrix[0];
    vec3 i1 = inMatrix[1];
    vec3 i2 = inMatrix[2];
    return mat3(
        vec3(i0.x, i1.x, i2.x),
        vec3(i0.y, i1.y, i2.y),
        vec3(i0.z, i1.z, i2.z));
}

void main() {
    float height = 0.0, xp = 0.0, zp = 0.0, k, g, t;
    for (int i = 0; i < 20; ++i) {
        k = 4.024322 * waves[i].z * waves[i].z;
        g = k * (vertexPosition.x * cos(waves[i].y) + vertexPosition.z * sin(waves[i].y))
            - 6.28318 * waves[i].z * time + waves[i].w;
        height += waves[i].x * cos(g);
        t = waves[i].x * -sin(g) * k;
        xp += t * cos(waves[i].y);
        zp += t * sin(waves[i].y);
    }
    vec3 position = vec3(vertexPosition.x, height, vertexPosition.z);
    vec3 tangent = normalize(vec3(0, zp, 1));
    vec3 bitangent = normalize(vec3(1, xp, 0));
    vec3 normal = cross(tangent, bitangent);

    mat4 MV = V * M;
    vec3 position_camera = (MV * vec4(position, 1)).xyz;
    vec3 eyeDirection_camera = vec3(V * vec4(0.0, 0.0, -1.0, 0.0));
    vec3 light_camera = (V * vec4(light_world, 1)).xyz;

    vec3 lightDirection_camera = light_camera + eyeDirection_camera;
    vec3 normal_camera = (MV * vec4(normal, 0)).xyz;
    vec3 tangent_camera = (MV * vec4(tangent, 0)).xyz;
    vec3 bitangent_camera = (MV * vec4(bitangent, 0)).xyz;

    mat3 TBN = transpose(mat3(tangent_camera, bitangent_camera, normal_camera));
    lightDirection_tangent = TBN * lightDirection_camera;
    eyeDirection_tangent = TBN * eyeDirection_camera;

    gl_Position = MVP * vec4(position, 1);
    UV = vertexUV;
}

