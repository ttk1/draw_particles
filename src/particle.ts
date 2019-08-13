import { Vec2 } from './vec2';

export class Particle {
    public position: Vec2;
    public velocity: Vec2;
    public acceleration: Vec2;

    constructor(position: Vec2, velocity: Vec2, acceleration: Vec2) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
    }
}
