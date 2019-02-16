class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    mul(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }
}

module.exports = Vec2;
