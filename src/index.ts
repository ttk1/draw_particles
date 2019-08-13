import TP from 'tweakpane';
import { Particle } from './particle';
import { Vec2 } from './vec2';

const PARAMS = {
    width: 500,
    height: 500,
    k: 10.0,
    h: 5.0,
    k_wall: 10.0,
    h_wall: 5.0,
    interval_ms: 5,
    magnification: 1,
    num_particle: 200,
    radius: 10,
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
    intervalId = window.setInterval(animate, PARAMS.interval_ms);
};

function animate() {
    refresh();
    particles.forEach((aparticl) => {
        draw_particle(aparticl);
    });
    step();
}

function initCanvas(): void {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas取得失敗');
    }
    canvas.width = PARAMS.width;
    canvas.height = PARAMS.height;
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
            min: 1.0,
            max: 20.0,
            step: 0.1
        });

        // アニメーションの間隔
        pane.addInput(PARAMS, 'interval_ms', {
            min: 5,
            max: 100,
            step: 1
        }).on('change', () => {
            window.clearInterval(intervalId);
            intervalId = window.setInterval(animate, PARAMS.interval_ms);
        });

        // キャンバスの高さ
        pane.addInput(PARAMS, 'height', {
            min: 50,
            max: 1000,
            step: 1
        }).on('change', () => {
            canvas.height = PARAMS.height;
        });

        // キャンバスの幅
        pane.addInput(PARAMS, 'width', {
            min: 50,
            max: 1000,
            step: 1
        }).on('change', () => {
            canvas.width = PARAMS.width;
        });

        // 移動距離の倍率
        pane.addInput(PARAMS, 'magnification', {
            min: 0.0,
            max: 5.0,
            step: 0.1
        });

        // 粒子の数
        pane.addInput(PARAMS, 'num_particle', {
            min: 0,
            max: 2000,
            step: 1
        }).on('change', () => {
            initParticles();
        });

        // 粒子同士の弾性係数
        pane.addInput(PARAMS, 'k', {
            min: 0.00,
            max: 20.0,
            step: 0.1
        });

        // 粒子同士の粘性係数
        pane.addInput(PARAMS, 'h', {
            min: 0.00,
            max: 20.0,
            step: 0.1
        });

        // 粒子対壁の弾性係数
        pane.addInput(PARAMS, 'k_wall', {
            min: 0.00,
            max: 20.0,
            step: 0.1
        });

        // 粒子対壁の粘性係数
        pane.addInput(PARAMS, 'h_wall', {
            min: 0.00,
            max: 20.0,
            step: 0.1
        });

        // 重力
        pane.addInput(PARAMS, 'gravity', {
            min: 0.00,
            max: 10.00,
            step: 0.01
        });

        // 重力方向
        pane.addInput(PARAMS, 'gravity_direction', {
            min: 0.00,
            max: 2.00,
            step: 0.01
        });
    }
    return;
}

function draw_particle(particle: Particle): void {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(particle.position.x, particle.position.y, PARAMS.radius, 0, 2 * Math.PI, true);
    ctx.fill();
}

function refresh(): void {
    // ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillStyle = '#eedcb3';
    ctx.fillRect(0, 0, PARAMS.width, PARAMS.height);
}

// 粘性抵抗マトリックス
const e: number[][] = [];

function step(): void {
    for (let i = 0; i < particles.length; i++) {
        let force = new Vec2(0.0, 0.0);
        const a = particles[i];
        for (let j = 0; j < particles.length; j++) {
            const b = particles[j];
            // 重力加速度
            force.x += PARAMS.gravity * Math.sin(Math.PI * PARAMS.gravity_direction);
            force.y += PARAMS.gravity * Math.cos(Math.PI * PARAMS.gravity_direction);

            // 粒子同士の衝突の処理
            if (i !== j && distance(a, b) < 2 * PARAMS.radius) {
                // 相対変位増分の計算
                const rvab = b.velocity.sub(a.velocity);
                const nab = b.position.sub(a.position).normalize();
                const u = rvab.dot(nab); // 衝突する向きが負になることに注意
                // 弾性力
                e[i][j] += PARAMS.k * u;
                // 粘性抵抗
                const d = PARAMS.h * (u / PARAMS.interval_ms);
                // 合力
                force = force.add(nab.scale(e[i][j] + d));
            } else {
                e[i][j] = 0;
            }
        }

        // 壁との衝突の処理
        // 左側
        if (a.position.x < PARAMS.radius) {
            const rvab = a.velocity.scale(-1);
            const nab = new Vec2(-1, 0);
            const u = rvab.dot(nab);
            e[i][PARAMS.num_particle] += PARAMS.k_wall * u;
            const d = PARAMS.h_wall * (u / PARAMS.interval_ms);
            force = force.add(nab.scale(e[i][PARAMS.num_particle] + d));
        } else {
            e[i][PARAMS.num_particle] = 0;
        }
        // 右側
        if (PARAMS.width - PARAMS.radius < a.position.x) {
            const rvab = a.velocity.scale(-1);
            const nab = new Vec2(1, 0);
            const u = rvab.dot(nab);
            e[i][PARAMS.num_particle + 1] += PARAMS.k_wall * u;
            const d = PARAMS.h_wall * (u / PARAMS.interval_ms);
            force = force.add(nab.scale(e[i][PARAMS.num_particle + 1] + d));
        } else {
            e[i][PARAMS.num_particle + 1] = 0;
        }
        // 上側
        if (a.position.y < PARAMS.radius) {
            const rvab = a.velocity.scale(-1);
            const nab = new Vec2(0, -1);
            const u = rvab.dot(nab);
            e[i][PARAMS.num_particle + 2] += PARAMS.k_wall * u;
            const d = PARAMS.h_wall * (u / PARAMS.interval_ms);
            force = force.add(nab.scale(e[i][PARAMS.num_particle + 2] + d));
        } else {
            e[i][PARAMS.num_particle + 2] = 0;
        }
        // 下側
        if (PARAMS.height - PARAMS.radius < a.position.y) {
            const rvab = a.velocity.scale(-1);
            const nab = new Vec2(0, 1);
            const u = rvab.dot(nab);
            e[i][PARAMS.num_particle + 3] += PARAMS.k_wall * u;
            const d = PARAMS.h_wall * (u / PARAMS.interval_ms);
            force = force.add(nab.scale(e[i][PARAMS.num_particle + 3] + d));
        } else {
            e[i][PARAMS.num_particle + 3] = 0;
        }
        a.acceleration = force.scale(1);
    }

    for (const particle of particles) {
        /////// 位置の計算 ///////
        particle.position = particle.position.add(particle.velocity.scale(PARAMS.interval_ms / 1000));
        /////// 速度の計算 ///////
        particle.velocity = particle.velocity.add(particle.acceleration.scale(PARAMS.interval_ms / 1000));
    }
}

function distance(a: Particle, b: Particle): number {
    return Math.sqrt((a.position.x - b.position.x) ** 2 + (a.position.y - b.position.y) ** 2);
}

function initParticles(): void {
    particles = [];
    for (let i = 0; i < PARAMS.num_particle; i++) {
        const particle = getParticle();
        if (particles.filter(
            (p: Particle) => distance(particle, p) < 2 * PARAMS.radius
        ).length === 0) {
            particles.push(particle);
        }
    }

    // あとで移動させたいけど、とりあえずここに置いておく
    for (let i = 0; i < particles.length; i++) {
        e[i] = [];
        for (let j = 0; j < particles.length + 4; j++) {
            e[i][j] = 0;
        }
    }
}

function getParticle(): Particle {
    const p: Vec2 = new Vec2(
        Math.random() * (PARAMS.width - PARAMS.radius),
        Math.random() * (PARAMS.height - PARAMS.radius)
    );
    const v: Vec2 = new Vec2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    const a: Vec2 = new Vec2(0.0, 0.0);
    return new Particle(p, v, a);
}
