import { Vec2 } from './vec2';

export class Particle {
    public position: Vec2;
    public velocity: Vec2;

    constructor(position: Vec2, velocity: Vec2) {
        this.position = position;
        this.velocity = velocity;
    }

    public copy(): Particle {
        return new Particle(this.position.copy(), this.velocity.copy());
    }
}
