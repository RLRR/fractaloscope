import { clamp } from './utils';

export class Vec2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vec: Vec2): Vec2 {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }

    sub(vec: Vec2): Vec2 {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    mul(scalar: number): Vec2 {
        return new Vec2(this.x * scalar, this.y * scalar);
    }

    clamp(minX: number, maxX: number, minY: number, maxY: number): Vec2 {
        return new Vec2(clamp(this.x, minX, maxX), clamp(this.y, minY, maxY));
    }
}
