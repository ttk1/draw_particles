export class Vec2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public copy(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public dot(a: Vec2): number {
        return this.x * a.x + this.y * a.y;
    }

    public scale(s: number): Vec2 {
        const newVec2 = this.copy();
        newVec2.x *= s;
        newVec2.y *= s;
        return newVec2;
    }

    public normalize(): Vec2 {
        const s = Math.sqrt(this.dot(this));
        return this.scale(1 / s);
    }

    public sub(a: Vec2): Vec2 {
        return new Vec2(this.x - a.x, this.y - a.y);
    }

    public add(a: Vec2): Vec2 {
        return new Vec2(this.x + a.x, this.y + a.y);
    }
}
