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
