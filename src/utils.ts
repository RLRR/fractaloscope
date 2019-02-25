type RGBA = [number, number, number, number];

export function clamp(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
}

export function hexToRgb(hex: string): RGBA {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
        255,
    ];
}

export function lerpColors(color1: RGBA, color2: RGBA, ratio: number): RGBA {
    return [
        color1[0] * (1 - ratio) + color2[0] * ratio,
        color1[1] * (1 - ratio) + color2[1] * ratio,
        color1[2] * (1 - ratio) + color2[2] * ratio,
        color1[3] * (1 - ratio) + color2[3] * ratio,
    ];
}
