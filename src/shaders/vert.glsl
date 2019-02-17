precision highp float;

attribute vec2 a_position;

uniform float aspectRatio;
uniform vec2 center;
uniform float scale;

varying vec2 coordinates;

void main() {
    coordinates = a_position;
    gl_Position = vec4((a_position * vec2(1, aspectRatio) - center) * scale, 0, 1);
}
