interface Window {
    scope: any;
    PointerEvent: any;
    DocumentTouch: any;
}

declare module '*.glsl' {
    const source: string;
    export default source;
}
