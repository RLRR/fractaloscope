import { clamp, lerpColors, getPeakVolume } from './utils';
import { GestureZoom } from './handlers/gestureZoom';
import { TouchMorph } from './handlers/touchMorph';
import { MouseMorph } from './handlers/mouseMorph';
import { MouseDrag } from './handlers/mouseDrag';
import { MouseZoom } from './handlers/mouseZoom';
import { TouchDrag } from './handlers/touchDrag';
import { TouchZoom } from './handlers/touchZoom';
import { SlidingWindow } from './slidingWindow';
import { getPalette } from './palettes';
import { Uniform } from './uniform';
import { Vec2 } from './vec2';

import {
    textureSize,
    paletteDuration,
    paletteChangeDuration,
    minX, minY,
    maxX, maxY,
    seedPeriod,
    seedAmplitude,
    minIterationLimit,
    maxIterationLimit,
    volumeWindowSize,
    minSeedX, maxSeedX,
    minSeedY, maxSeedY,
    minZoom, maxZoom,
} from './constants';

import vertGlsl from './shaders/vert.glsl';
import fragGlsl from './shaders/frag.glsl';

export class Scope {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;

    private eventHandlers: {[key: string]: () => void};

    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private textures: [WebGLTexture, WebGLTexture];

    private audioElement: HTMLAudioElement;
    private analyser?: AnalyserNode;
    private volumeWindow: SlidingWindow;

    private seedUniform: Uniform;
    private centerUniform: Uniform;
    private scaleUniform: Uniform;
    private aspectRatioUniform: Uniform;
    private iterationLimitUniform: Uniform;

    private textureRatioUniform: Uniform;
    private textureSizeUniform: Uniform;
    private prevTextureUniform: Uniform;
    private currTextureUniform: Uniform;

    private paletteSetTime: number;
    private currTextureIndex: 0 | 1;
    private prevPalette: Uint8Array;
    private currPalette: Uint8Array;

    private width: number;
    private height: number;

    private hdMode: boolean;

    private center: Vec2;
    private seed: Vec2;
    private zoom: number;

    constructor(domElement: HTMLElement, audioElement: HTMLAudioElement) {
        this.container = domElement;
        this.canvas = document.createElement('canvas');
        domElement.appendChild(this.canvas);

        window.addEventListener('resize', this.resetSize);

        const gl = this.canvas.getContext('webgl', { antialias: false }) as WebGLRenderingContext;
        const program = gl.createProgram() as WebGLProgram;
        const texture0 = gl.createTexture() as WebGLTexture;
        const texture1 = gl.createTexture() as WebGLTexture;

        this.gl = gl;
        this.program = program;
        this.textures = [texture0, texture1];

        this.audioElement = audioElement;
        this.volumeWindow = new SlidingWindow(volumeWindowSize);

        this.initShaders();

        this.seedUniform = new Uniform(gl, program, 'seed', '2f');
        this.centerUniform = new Uniform(gl, program, 'center', '2f');
        this.scaleUniform = new Uniform(gl, program, 'scale', '1f');
        this.aspectRatioUniform = new Uniform(gl, program, 'aspectRatio', '1f');
        this.iterationLimitUniform = new Uniform(gl, program, 'iterationLimit', '1i');
        this.textureRatioUniform = new Uniform(gl, program, 'textureRatio', '1f');
        this.textureSizeUniform = new Uniform(gl, program, 'textureSize', '1i');
        this.prevTextureUniform = new Uniform(gl, program, 'prevTexture', '1i');
        this.currTextureUniform = new Uniform(gl, program, 'currTexture', '1i');

        this.paletteSetTime = Date.now();
        this.currTextureIndex = 0;

        this.prevPalette = new Uint8Array(0);
        this.currPalette = new Uint8Array(0);

        this.switchPalette();
        window.setInterval(this.switchPalette, paletteDuration);

        this.hdMode = false;

        this.center = new Vec2(0, 0);
        this.seed = new Vec2(0, 0);
        this.zoom = 0;

        this.eventHandlers = {};

        this.width = 0;
        this.height = 0;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.resetSize();

        this.initGeometry();
        this.initTextures();
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
        this.center = center.clamp(minX, maxX, minY, maxY);
        this.centerUniform.set(this.center.x, this.center.y);
    }

    public getCenter(): Vec2 {
        return this.center;
    }

    public setZoom(zoom: number): void {
        this.zoom = clamp(zoom, minZoom, maxZoom);
        this.scaleUniform.set(Math.pow(2, this.zoom));
    }

    public getZoom(): number {
        return this.zoom;
    }

    public setSeed(seed: Vec2): void {
        this.seed = seed.clamp(minSeedX, maxSeedX, minSeedY, maxSeedY);
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

    public resetSize = (): void => {
        const { gl, canvas, container } = this;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scaledWidth = this.hdMode ? width * window.devicePixelRatio : width;
        const scaledHeight = this.hdMode ? height * window.devicePixelRatio : height;

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        gl.viewport(0, 0, scaledWidth, scaledHeight);
        this.aspectRatioUniform.set(width / height);

        this.width = width;
        this.height = height;
    }

    public playAudio(): void {
        if (this.analyser === undefined) {
            this.initAudio();
        }

        this.audioElement.play();
    }

    public pauseAudio(): void {
        this.audioElement.pause();
    }

    public enableHd(): void {
        this.hdMode = true;
        this.resetSize();
    }

    public disableHd(): void {
        this.hdMode = false;
        this.resetSize();
    }

    public on(eventName: string, handler: () => void): void {
        this.eventHandlers[eventName] = handler;
    }

    public off(eventName: string): void {
        delete this.eventHandlers[eventName];
    }

    public fire(eventName: string): void {
        const handler = this.eventHandlers[eventName];

        if (handler !== undefined) {
            handler();
        }
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

    private initTextures(): void {
        const pixels = getPalette();

        this.initTexture(0, pixels);
        this.initTexture(1, pixels);

        this.prevPalette = pixels;
        this.currPalette = pixels;

        this.textureSizeUniform.set(textureSize);

        this.prevTextureUniform.set(0);
        this.currTextureUniform.set(1);
    }

    private initTexture(index: number, pixels: Uint8Array): void {
        const { gl } = this;

        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[index]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            textureSize,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels,
        );
    }

    private initGeometry(): void {
        const { gl } = this;

        const vertices = new Float32Array([
            minX, minY,
            maxX, minY,
            minX, maxY,
            minX, maxY,
            maxX, minY,
            maxX, maxY,
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    private switchPalette = (): void => {
        const { gl } = this;

        const currTextureIndex = this.currTextureIndex === 0 ? 1 : 0;
        const prevTextureIndex = this.currTextureIndex;

        const pixels = getPalette();

        gl.activeTexture(gl.TEXTURE0 + currTextureIndex);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[currTextureIndex]);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            textureSize,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels,
        );

        this.currTextureUniform.set(currTextureIndex);
        this.prevTextureUniform.set(prevTextureIndex);

        this.prevPalette = this.currPalette;
        this.currPalette = pixels;

        this.currTextureIndex = currTextureIndex;
        this.paletteSetTime = Date.now();
    }

    private initState(): void {
        this.setCenter(new Vec2(-0.52, 0.252));
        this.setSeed(new Vec2(-0.529, 0.524));
        this.setZoom(2);

        this.iterationLimitUniform.set(150);
    }

    private initHandlers(): void {
        new MouseDrag(this);
        new MouseZoom(this);
        new MouseMorph(this);
        new TouchDrag(this);
        new TouchZoom(this);
        new TouchMorph(this);
        new GestureZoom(this);
    }

    private initAudio(): void {
        const audioContext = window.AudioContext || window.webkitAudioContext;

        if (audioContext === undefined) {
            return;
        }

        const ctx = new audioContext();
        const analyser = ctx.createAnalyser();
        const source = ctx.createMediaElementSource(this.audioElement);

        source.connect(analyser);
        analyser.connect(ctx.destination);

        this.analyser = analyser;
    }

    private render = (): void => {
        const { gl } = this;

        requestAnimationFrame(this.render);

        this.updateIterationLimit();
        this.updateTextureRatio();
        this.updateSeed();

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    private updateIterationLimit(): void {
        if (this.analyser === undefined) {
            return;
        }

        this.volumeWindow.push(getPeakVolume(this.analyser));

        const volume = this.volumeWindow.getMean();

        this.iterationLimitUniform.set(
            maxIterationLimit - volume * (maxIterationLimit - minIterationLimit),
        );
    }

    private updateTextureRatio(): void {
        const { gl, prevPalette, currPalette } = this;

        const paletteSetElapsedTime = Date.now() - this.paletteSetTime;
        const textureRatio = clamp(paletteSetElapsedTime / paletteChangeDuration, 0, 1);

        this.textureRatioUniform.set(textureRatio);

        const clearColor = lerpColors(
            [prevPalette[0], prevPalette[1], prevPalette[2], prevPalette[3]],
            [currPalette[0], currPalette[1], currPalette[2], currPalette[3]],
            textureRatio,
        );

        gl.clearColor(
            clearColor[0] / 255,
            clearColor[1] / 255,
            clearColor[2] / 255,
            clearColor[3] / 255,
        );
    }

    private updateSeed(): void {
        const { seed, zoom } = this;
        const scale = Math.pow(2, zoom);
        const time = Date.now();

        this.seedUniform.set(
            seed.x + Math.cos((12 / 13) * time / seedPeriod) * seedAmplitude / scale,
            seed.y + 0.5 * Math.sin(time / seedPeriod) * seedAmplitude / scale,
        );
    }
}
