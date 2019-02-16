var colorbrewer = require('./vendor/colorbrewer');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255
    ];
}

module.exports = [{
    size: 9,
    data: (function() {
        var colors = colorbrewer.BuPu['9'].map(hexToRgb).reverse();
        var result = [];
        result =  result.concat.apply(result, colors);

        return new Uint8Array(result);
    }())
},{
    name: 'hot',
    size: 256,
    circular: false,
    data: (function getHotPalette(size) {
        var colors = [];
        var n = 3 * size / 8;

        for (var i = 0; i < size; i++) {
            let r = i < n ? (i + 1) / n : 1;
            let g = i < n ? 0 : (i < 2 * n ? (i - n) / n : 1);
            let b = i < 2 * n ? 0 : (i - 2 * n) / (size - 2 * n);
            colors.push(
                Math.round(r * 255),
                Math.round(g * 255),
                Math.round(b * 255),
                255
            );
        }

        return new Uint8Array(colors);
    }(256))
}, {
    name: 'night',
    size: 2,
    circular: false,
    data: new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255])
}, {
    name: 'gray',
    size: 2,
    circular: false,
    data: new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255])
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
        255,   0,   0, 255
    ])
}];
