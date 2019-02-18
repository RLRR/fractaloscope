import { textures } from './textures';
import { Vec2 } from './vec2';
import { MouseDrag } from './handler/mouseDrag';
import { MouseZoom } from './handler/mouseZoom';
import { MouseInteraction } from './handler/mouseInteraction';
import { Uniform } from './uniform';

import vertGlsl from './shaders/vert.glsl';
import fragGlsl from './shaders/frag.glsl';

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
        domElement.appendChild(this.canvas);

        window.addEventListener('resize', this.resetSize);

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

        this.width = 0;
        this.height = 0;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.resetSize();

        this.initGeometry();
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
        const aspectRatio = size.x / size.y;

        return new Vec2(
                coords.x / size.x * 2 - 1,
                ((size.y - coords.y) / size.y * 2 - 1) / aspectRatio,
            )
            .mul(1 / Math.pow(2, this.zoom))
            .add(this.center);
    }

    public unprojectSeed(coords: Vec2): Vec2 {
        const size = this.getSize();
        const aspectRatio = size.x / size.y;

        return new Vec2(
                coords.x / size.x * 2 - 1,
                ((size.y - coords.y) / size.y * 2 - 1) / aspectRatio,
            )
            .mul(1 / Math.pow(2, this.zoom))
            .add(this.seed);
    }

    public resetSize = (): void => {
        const { gl, canvas, container } = this;

        const width = container.clientWidth;
        const height = container.clientHeight;

        canvas.width = width;
        canvas.height = height;

        gl.viewport(0, 0, width, height);
        this.aspectRatioUniform.set(width / height);

        this.width = width;
        this.height = height;
    }

    private initShaders(): void {
        const { gl, program } = this;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        gl.shaderSource(vertexShader, vertGlsl);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(fragmentShader, fragGlsl);
        gl.compileShader(fragmentShader);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
    }

    private initGeometry(): void {
        const { gl } = this;

        const min = -3;
        const max = 3;

        const vertices = new Float32Array([
            min, min,
            max, min,
            min, max,
            min, max,
            max, min,
            max, max,
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    private setTexture(index: number): void {
        const { gl } = this;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const data = textures[index].data;
        this.textureSizeUniform.set(textures[index].size);

        gl.clearColor(
            data[0] / 255,
            data[1] / 255,
            data[2] / 255,
            data[3] / 255,
        );

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            data.length / 4,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data,
        );
    }

    private initState(): void {
        this.setCenter(new Vec2(0.129, 0.235));
        this.setSeed(new Vec2(-0.786, 0.154));
        this.setZoom(2.5);
        this.setTexture(0);

        this.maxIterationCountUniform.set(150);
    }

    private initHandlers(): void {
        new MouseDrag(this);
        new MouseZoom(this);
        new MouseInteraction(this);
    }

    private render = (): void => {
        const { gl } = this;

        requestAnimationFrame(this.render);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
