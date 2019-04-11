precision highp float;

uniform vec2 seed;
uniform int iterationLimit;

uniform sampler2D prevTexture;
uniform sampler2D currTexture;

uniform int textureSize;
uniform float textureRatio;

varying vec2 coordinates;

void main() {
    vec2 z = coordinates;
    int iterationCount = 0;

    for (int i = 0; i < 200; i++) {
        if (i == iterationLimit) {
            break;
        }

        float xx = z.x * z.x;
        float yy = z.y * z.y;
        float xy = z.x * z.y;

        z = vec2(xx - yy, xy + xy) + seed;

        if (dot(z, z) > 4.0) {
            break;
        }

        iterationCount++;
    }

    float level = float(iterationCount) / float(iterationLimit);
    float step = 1.0 / float(textureSize);
    float uv = level * (1.0 - step) + step / 2.0;

    vec2 coord = vec2(uv, 0.5);

    vec4 prevColor = texture2D(prevTexture, coord);
    vec4 currColor = texture2D(currTexture, coord);

    gl_FragColor = mix(prevColor, currColor, textureRatio);
}
