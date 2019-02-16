var textures = require('./textures');
var Vec2 = require('./Vec2');
var MouseDrag = require('./handler/MouseDrag');
var MouseZoom = require('./handler/MouseZoom');
var MouseInteraction = require('./handler/MouseInteraction');

class Scope {
    constructor(domElement) {
        this._container = domElement;
        this._canvas = document.createElement('canvas');

        this._gl = this._canvas.getContext('webgl');

        domElement.appendChild(this._canvas);

        this._canvas.style.width = '100%';
        this._canvas.style.height = '100%';

        this._width = this._canvas.width = this._canvas.offsetWidth;
        this._height = this._canvas.height = this._canvas.offsetHeight;

        this._initWebGl();
        this._initShaders();
        this._initRectangle();

        this._initState();

        this._initAudio();

        this._initHandlers();

        this._render();
    }

    getContainer() {
        return this._container;
    }

    getSize() {
        return new Vec2(this._width, this._height);
    }

    setCenter(center) {
        this._center = center;
        this._setUniform('center', center.x, center.y);
    }

    getCenter() {
        return this._center;
    }

    setZoom(zoom) {
        this._zoom = zoom;
        this._scale = Math.pow(2, zoom);
        this._setUniform('scale', this._scale);
    }

    getZoom() {
        return this._zoom;
    }

    setSeed(seed) {
        this._seed = seed;
        this._setUniform('seed', seed.x, seed.y);
    }

    getSeed() {
        return this._seed;
    }

    setSeedCenter(center) {
        this._seedCenter = center;
    }

    getSeedCenter(center) {
        return this._seedCenter;
    }

    unproject(coords) {
        var size = this.getSize();

        return new Vec2(
                coords.x / size.x * 2 - 1,
                (size.y - coords.y) / size.y * 2 - 1
            )
            .mul(1 / this._scale)
            .add(this._center);
    }

    unprojectSeed(coords) {
        var size = this.getSize();

        return new Vec2(
                coords.x / size.x * 2 - 1,
                (size.y - coords.y) / size.y * 2 - 1
            )
            .mul(1 / this._scale)
            .add(this._center);
    }

    _initWebGl() {
        var gl = this._gl;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    _initShaders() {
        var gl = this._gl;

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, require('./shaders/vertex.glsl'));
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, require('./shaders/fragment.glsl'));
        gl.compileShader(fragmentShader);

        var program = this._program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.useProgram(program);

        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl.getShaderInfoLog(fragmentShader));

        this._uniforms = {
            seed: {setter: 'uniform2f'},
            center: {setter: 'uniform2f'},
            scale: {setter: 'uniform1f'},
            aspectRatio: {setter: 'uniform1f'},
            maxIter: {setter: 'uniform1i'},
            textureSize: {setter: 'uniform1i'}
        };

        for (let key in this._uniforms) {
            this._uniforms[key].loc = gl.getUniformLocation(program, key);
        }
    }

    _initRectangle() {
        var gl = this._gl;

        var minX = -3;
        var maxX = 3;
        var minY = -2;
        var maxY = 2;

        var vertices = new Float32Array([
            minX, minY,
            maxX, minY,
            minX, maxY,
            minX, maxY,
            maxX, minY,
            maxX, maxY
        ]);

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var positionLocation = gl.getAttribLocation(this._program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    setTexture(index) {
        var gl = this._gl;

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var data = textures[index].data;
        this._setUniform('textureSize', textures[index].size);

        gl.clearColor(data[0] / 255, data[1] / 255, data[2] / 255, data[3] / 255);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, data.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                      data);
    }

    _initState() {
        this.setCenter(new Vec2(0, 0));
        this.setZoom(-2);
        this.setSeedCenter(new Vec2(0.156, 0.8));
        this.setTexture(2);

        this._setUniform('maxIter', 300);
        this._setUniform('aspectRatio', this._width / this._height);
    }

    _initAudio() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var analyser = audioCtx.createAnalyser();

        var source = audioCtx.createMediaElementSource(document.getElementById('sound'));
        source.connect(analyser);
    }

    _initHandlers() {
        new MouseDrag(this);
        new MouseZoom(this);
        new MouseInteraction(this);
    }

    _setUniform(name, ...values) {
        this._gl[this._uniforms[name].setter](this._uniforms[name].loc, ...values);
    }

    _draw() {
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
    }

    _render() {
        requestAnimationFrame(this._render.bind(this));

        this._time = Date.now();

        var seedCenter = this.getSeedCenter();
        this.setSeed(new Vec2(
            seedCenter.x + Math.sin((12 / 13) * this._time / 1000) * 0.01 / this._scale,
            seedCenter.y + 0.5 * Math.sin(this._time / 1000) * 0.01 / this._scale
        ));

        this._draw();
    }
}

module.exports = Scope;
