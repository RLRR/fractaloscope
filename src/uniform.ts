type UniformType =
    | '1i'
    | '1f'
    | '2f'
    ;

export class Uniform {
    private type: UniformType;

    private gl: WebGLRenderingContext;
    private location: WebGLUniformLocation;

    constructor(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        name: string,
        type: UniformType,
    ) {
        this.gl = gl;
        this.type = type;

        this.location = gl.getUniformLocation(program, name) as WebGLUniformLocation;
    }

    set(...value: number[]): void {
        const {gl, location} = this;

        switch(this.type) {
            case '1i':
            case '1f':
                gl.uniform1i(location, value[0]);
                break;
            case '2f':
                gl.uniform2f(location, value[0], value[1]);
                break;
        }
    }
}