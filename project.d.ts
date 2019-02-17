interface Window {
    scope: any;
}

declare module '*.glsl' {
    const source: string;
    export default source;
}