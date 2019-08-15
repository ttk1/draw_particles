import TP from 'tweakpane';
import { Particle } from './particle';
import { Vec2 } from './vec2';

const CANVAS_SIZE = 500;
const PARAMS = {
    k: 0.01,
    h: 0.00001,
    k_wall: 0.1,
    h_wall: 0.00001,
    interval: 0.001,
    frame_rate: 30,
    num_particle: 100,
    radius: 0.02,
    mass: 0.001,
    gravity: 9.8,
    gravity_direction: 0
};

let intervalId: number;
let particles: Particle[];
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

window.onload = (): void => {
    initCanvas();
    initPane();
    initParticles();
    intervalId = window.setInterval(animate, 1000 / PARAMS.frame_rate);
};

function animate() {
    refresh();
    particles.forEach((particle) => {
        draw_particle(particle);
    });
    const framePerStep = Math.ceil((1 / PARAMS.frame_rate) / PARAMS.interval);
    for (let i = 0; i < framePerStep; i++) {
        step();
    }
}

function initCanvas(): void {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas取得失敗');
    }
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) {
        throw new Error('Context2D取得失敗');
    }
}

function initPane(): void {
    const paneContainer = document.getElementById('pane');
    if (paneContainer) {
        paneContainer.style.width = '500px';
        const Tweakpane = require('tweakpane');
        const pane = new Tweakpane({
            container: document.getElementById('pane'),
        }) as TP;

        // 粒子の半径
        pane.addInput(PARAMS, 'radius', {
            label: '粒子の半径(m)',
            min: 0.01,
            max: 0.10,
            step: 0.01
        });

        // 粒子の質量
        pane.addInput(PARAMS, 'mass', {
            label: '粒子の質量(kg)',
            min: 0.001,
            max: 0.100,
            step: 0.001
        });

        // 刻み幅
        pane.addInput(PARAMS, 'interval', {
            label: '刻み幅(s)',
            min: 0.0001,
            max: 0.100,
            step: 0.0001
        });

        // 描画のフレームレート
        pane.addInput(PARAMS, 'frame_rate', {
            label: '描画のフレームレート(fps)',
            min: 1,
            max: 100,
            step: 1
        }).on('change', () => {
            window.clearInterval(intervalId);
            intervalId = window.setInterval(animate, 1000 / PARAMS.frame_rate);
        });

        // 粒子の数
        pane.addInput(PARAMS, 'num_particle', {
            label: '粒子の数',
            min: 0,
            max: 2000,
            step: 1
        }).on('change', () => {
            initParticles();
        });

        // 粒子同士の弾性係数
        pane.addInput(PARAMS, 'k', {
            label: '粒子同士の弾性係数(単位不明)',
            min: 0.0000,
            max: 1.0000,
            step: 0.0001
        });

        // 粒子同士の粘性係数
        pane.addInput(PARAMS, 'h', {
            label: '粒子同士の粘性係数(単位不明)',
            min: 0.0000,
            max: 1.0000,
            step: 0.00001
        });

        // 粒子対壁の弾性係数
        pane.addInput(PARAMS, 'k_wall', {
            label: '粒子対壁の弾性係数(単位不明)',
            min: 0.0000,
            max: 1.0000,
            step: 0.0001
        });

        // 粒子対壁の粘性係数
        pane.addInput(PARAMS, 'h_wall', {
            label: '粒子対壁の粘性係数(単位不明)',
            min: 0.0000,
            max: 1.0000,
            step: 0.00001
        });

        // 重力加速度
        pane.addInput(PARAMS, 'gravity', {
            label: '重力加速度(m/s^2)',
            min: 0.00,
            max: 10.00,
            step: 0.01
        });

        // 重力方向
        pane.addInput(PARAMS, 'gravity_direction', {
            label: '重力方向(rad)',
            min: 0.00,
            max: 2.00 * Math.PI,
            step: 0.01
        });
    }
    return;
}

function draw_particle(particle: Particle): void {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
        CANVAS_SIZE * particle.position.x,
        CANVAS_SIZE * particle.position.y,
        CANVAS_SIZE * PARAMS.radius,
        0, 2 * Math.PI, true
    );
    ctx.fill();
}

function refresh(): void {
    ctx.fillStyle = '#eedcb3';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

const e: number[][] = [];

function step(): void {
    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        let force = new Vec2(0.0, 0.0);
        // 重力
        force.x += PARAMS.mass * PARAMS.gravity * Math.sin(PARAMS.gravity_direction);
        force.y += PARAMS.mass * PARAMS.gravity * Math.cos(PARAMS.gravity_direction);

        // 粒子同士の衝突
        for (let j = 0; j < particles.length; j++) {
            const b = particles[j];
            if (a !== b && a.distance(b) < 2 * PARAMS.radius) {
                const nab = b.position.sub(a.position).normalize();
                const u = nab.dot(b.velocity.sub(a.velocity));
                // 弾性力
                e[i][j] += PARAMS.k * u;
                // 粘性抵抗
                const d = PARAMS.h * (u / PARAMS.interval);
                // 合力
                force = force.add(nab.scale(e[i][j] + d));
            } else {
                e[i][j] = 0;
            }
        }

        // 壁との衝突
        // 左側
        if (a.position.x < PARAMS.radius) {
            const nab = new Vec2(-1, 0);
            const u = nab.dot(a.velocity.scale(-1));
            e[i][particles.length] += PARAMS.k_wall * u;
            force = force.add(nab.scale(e[i][particles.length] + PARAMS.h_wall * u / PARAMS.interval));
        } else {
            e[i][particles.length] = 0;
        }
        // 右側
        if (1 - PARAMS.radius < a.position.x) {
            const nab = new Vec2(1, 0);
            const u = nab.dot(a.velocity.scale(-1));
            e[i][particles.length + 1] += PARAMS.k_wall * u;
            force = force.add(nab.scale(e[i][particles.length + 1] + PARAMS.h_wall * u / PARAMS.interval));
        } else {
            e[i][particles.length + 1] = 0;
        }
        // 上側
        if (a.position.y < PARAMS.radius) {
            const nab = new Vec2(0, -1);
            const u = nab.dot(a.velocity.scale(-1));
            e[i][particles.length + 2] += PARAMS.k_wall * u;
            force = force.add(nab.scale(e[i][particles.length + 2] + PARAMS.h_wall * u / PARAMS.interval));
        } else {
            e[i][particles.length + 2] = 0;
        }
        // 下側
        if (1 - PARAMS.radius < a.position.y) {
            const nab = new Vec2(0, 1);
            const u = nab.dot(a.velocity.scale(-1));
            e[i][particles.length + 3] += PARAMS.k_wall * u;
            force = force.add(nab.scale(e[i][particles.length + 3] + PARAMS.h_wall * u / PARAMS.interval));
        } else {
            e[i][particles.length + 3] = 0;
        }

        // 加速度の計算
        a.acceleration = force.scale(1 / PARAMS.mass);
    }
    for (const particle of particles) {
        // 位置
        particle.position = particle.position.add(particle.velocity.scale(PARAMS.interval));
        // 速度
        particle.velocity = particle.velocity.add(particle.acceleration.scale(PARAMS.interval));
    }
}

function initParticles(): void {
    particles = [];
    for (let i = 0; i < PARAMS.num_particle; i++) {
        const particle = getParticle();
        if (particles.filter(
            (p: Particle) => particle.distance(p) < 2 * PARAMS.radius
        ).length === 0) {
            particles.push(particle);
        }
    }
    for (let i = 0; i < particles.length; i++) {
        e[i] = [];
        for (let j = 0; j < particles.length + 4; j++) {
            e[i][j] = 0;
        }
    }
}

function getParticle(): Particle {
    const p: Vec2 = new Vec2(
        Math.random() * (1 - 2 * PARAMS.radius) + PARAMS.radius,
        Math.random() * (1 - 2 * PARAMS.radius) + PARAMS.radius
    );
    const v: Vec2 = new Vec2(0.0, 0.0);
    const a: Vec2 = new Vec2(0.0, 0.0);
    return new Particle(p, v, a);
}
