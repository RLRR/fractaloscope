import { textures } from './textures';
import { Vec2 } from './vec2';
import { MouseDrag } from './handler/mouseDrag';
import { MouseZoom } from './handler/mouseZoom';
import { MouseInteraction } from './handler/mouseInteraction';
import { Uniform } from './uniform';

import vertexShaderCode from './shaders/vertex.glsl';
import fragmentShaderCode from './shaders/fragment.glsl';

export class Scope {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;

    private seedUniform: Uniform;
    private centerUniform: Uniform;
    private scaleUniform: Uniform;
    private aspectRatioUniform: Uniform;
    private maxIterationCountUniform: Uniform;
    private textureSizeUniform: Uniform;

    private width: number;
    private height: number;

    private center: Vec2;
    private seed: Vec2;
    private zoom: number;

    constructor(domElement: HTMLElement) {
        this.container = domElement;
        this.canvas = document.createElement('canvas');

        const gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
        const program = gl.createProgram() as WebGLProgram;

        this.gl = gl;
        this.program = program;

        this.initShaders();

        this.seedUniform = new Uniform(gl, program, 'seed', '2f');
        this.centerUniform = new Uniform(gl, program, 'center', '2f');
        this.scaleUniform = new Uniform(gl, program, 'scale', '1f');
        this.aspectRatioUniform = new Uniform(gl, program, 'aspectRatio', '1f');
        this.maxIterationCountUniform = new Uniform(gl, program, 'maxIter', '1i');
        this.textureSizeUniform = new Uniform(gl, program, 'textureSize', '1i');

        this.center = new Vec2(0, 0);
        this.seed = new Vec2(0, 0);
        this.zoom = 0;

        domElement.appendChild(this.canvas);

        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = this.canvas.offsetHeight;

        this.initWebGl();
        this.initRectangle();
        this.initState();
        this.initHandlers();

        this.render();
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getSize(): Vec2 {
        return new Vec2(this.width, this.height);
    }

    public setCenter(center: Vec2): void {
        this.center = center;
        this.centerUniform.set(center.x, center.y);
    }

    public getCenter(): Vec2 {
        return this.center;
    }

    public setZoom(zoom: number): void {
        this.zoom = zoom;
        this.scaleUniform.set(Math.pow(2, zoom));
    }

    public getZoom(): number {
        return this.zoom;
    }

    public setSeed(seed: Vec2): void {
        this.seed = seed;
        this.seedUniform.set(seed.x, seed.y);
    }

    public getSeed(): Vec2 {
        return this.seed;
    }

    public unproject(coords: Vec2): Vec2 {
        const size = this.getSize();

        return new Vec2(
                coords.x / size.x * 2 - 1,
                (size.y - coords.y) / size.y * 2 - 1
            )
            .mul(1 / Math.pow(2, this.zoom))
            .add(this.center);
    }

    public unprojectSeed(coords: Vec2): Vec2 {
        const size = this.getSize();

        return new Vec2(
                coords.x / size.x * 2 - 1,
                (size.y - coords.y) / size.y * 2 - 1
            )
            .mul(1 / Math.pow(2, this.zoom))
            .add(this.center);
    }

    private initWebGl(): void {
        const {gl} = this;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    private initShaders(): void {
        const {gl, program} = this;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        gl.shaderSource(vertexShader, vertexShaderCode);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(fragmentShader, fragmentShaderCode);
        gl.compileShader(fragmentShader);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
    }

    private initRectangle(): void {
        const {gl} = this;

        const minX = -3;
        const maxX = 3;
        const minY = -2;
        const maxY = 2;

        const vertices = new Float32Array([
            minX, minY,
            maxX, minY,
            minX, maxY,
            minX, maxY,
            maxX, minY,
            maxX, maxY
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    private setTexture(index: number): void {
        const {gl} = this;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const data = textures[index].data;
        this.textureSizeUniform.set(textures[index].size);

        gl.clearColor(data[0] / 255, data[1] / 255, data[2] / 255, data[3] / 255);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, data.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                      data);
    }

    private initState(): void {
        this.setCenter(new Vec2(0, 0));
        this.setZoom(-2);
        this.setSeed(new Vec2(0.156, 0.8));
        this.setTexture(0);

        this.maxIterationCountUniform.set(150);
        this.aspectRatioUniform.set(this.width / this.height);
    }

    private initHandlers(): void {
        new MouseDrag(this);
        new MouseZoom(this);
        new MouseInteraction(this);
    }

    private render() {
        const {gl} = this;

        requestAnimationFrame(this.render.bind(this));

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
