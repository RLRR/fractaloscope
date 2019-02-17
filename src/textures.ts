import { colorbrewer } from './vendor/colorbrewer';
import { RGBA } from './types';

function hexToRgb(hex: string): RGBA {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
        255,
    ];
}

export const textures = [{
    size: 9,
    data: (function () {
        const colors = colorbrewer.BuPu['9'].map(hexToRgb).reverse();
        let result: any[] = [];
        result =  result.concat.apply(result, colors);

        return new Uint8Array(result);
    }()),
}, {
    name: 'hot',
    size: 256,
    circular: false,
    data: (function getHotPalette(size) {
        const colors: number[] = [];
        const n = 3 * size / 8;

        for (let i = 0; i < size; i++) {
            const r = i < n ? (i + 1) / n : 1;
            const g = i < n ? 0 : (i < 2 * n ? (i - n) / n : 1);
            const b = i < 2 * n ? 0 : (i - 2 * n) / (size - 2 * n);
            colors.push(
                Math.round(r * 255),
                Math.round(g * 255),
                Math.round(b * 255),
                255,
            );
        }

        return new Uint8Array(colors);
    }(256)),
}, {
    name: 'night',
    size: 2,
    circular: false,
    data: new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255]),
}, {
    name: 'gray',
    size: 2,
    circular: false,
    data: new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255]),
}, {
    name: 'bicycle',
    size: 6,
    circular: true,
    data: new Uint8Array([
        255,   0,   0, 255,
        255, 255,   0, 255,
        0, 255,   0, 255,
        0, 255, 255, 255,
        0,   0, 255, 255,
        255,   0, 255, 255,
        255,   0,   0, 255,
    ]),
}];
