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

    float iterationCount = 0.0;

    for (int i = 0; i < 1000; i++) {
        if (i >= iterationLimit) {
            break;
        }

        float x = (z.x * z.x - z.y * z.y) + seed.x;
        float y = (z.y * z.x + z.x * z.y) + seed.y;

        if ((x * x + y * y) > 4.0) {
            break;
        }

        z.x = x;
        z.y = y;

        iterationCount = float(i);
    }

    float level = iterationCount / float(iterationLimit);

    float step = 1.0 / float(textureSize);
    level = level * (1.0 - step) + step / 2.0;

    vec4 prevColor = texture2D(prevTexture, vec2(level, 0.5));
    vec4 currColor = texture2D(currTexture, vec2(level, 0.5));

    gl_FragColor = mix(prevColor, currColor, textureRatio);
}
