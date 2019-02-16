precision highp float;

uniform vec2 seed;
uniform int maxIter;

uniform sampler2D texture;
uniform int textureSize;

varying vec2 coordinates;

void main() {
    vec2 z = coordinates;

    float iterationsCount = 0.0;

    for (int i = 0; i < 1000; i++) {
        if (i >= maxIter) {
            break;
        }

        float x = (z.x * z.x - z.y * z.y) + seed.x;
        float y = (z.y * z.x + z.x * z.y) + seed.y;

        if ((x * x + y * y) > 4.0) {
            break;
        }

        z.x = x;
        z.y = y;

        iterationsCount = float(i);
    }

    float level = iterationsCount / float(maxIter);

    float step = 1.0 / float(textureSize);
    level = level * (1.0 - step) + step / 2.0;

    gl_FragColor = texture2D(texture, vec2(level, 0.5));
}
