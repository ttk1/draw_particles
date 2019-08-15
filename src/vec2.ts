export class Vec2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public dot(a: Vec2): number {
        return this.x * a.x + this.y * a.y;
    }

    public scale(s: number): Vec2 {
        return new Vec2(this.x * s, this.y * s);
    }

    public normalize(): Vec2 {
        return this.scale(1 / this.length());
    }

    public sub(a: Vec2): Vec2 {
        return new Vec2(this.x - a.x, this.y - a.y);
    }

    public add(a: Vec2): Vec2 {
        return new Vec2(this.x + a.x, this.y + a.y);
    }

    public length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
}
