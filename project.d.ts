interface Window {
    scope: any;
    WebGLRenderingContext: WebGLRenderingContext;
}

declare module '*.glsl' {
    const source: string;
    export default source;
}
