import TP from 'tweakpane';
import { Particle } from './particle';
import { Vec2 } from './vec2';

const PARAMS = {
    width: 500,
    height: 500,
    cor: 0.50,
    cor_wall: 0.95,
    interval_ms: 10,
    magnification: 1,
    num_particle: 700,
    radius: 10,
    gravity: 0.3,
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

        // 粒子同士の反発係数
        pane.addInput(PARAMS, 'cor', {
            min: 0.00,
            max: 1.00,
            step: 0.01
        });

        // 粒子同士の反発係数
        pane.addInput(PARAMS, 'cor_wall', {
            min: 0.00,
            max: 1.00,
            step: 0.01
        });

        // 重力
        pane.addInput(PARAMS, 'gravity', {
            min: 0.00,
            max: 1.00,
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

// 相互作用の計算
function step(): void {
    /////// 位置の計算 ///////

    for (const particle of particles) {
        particle.position.x += particle.velocity.x * PARAMS.magnification;
        particle.position.y += particle.velocity.y * PARAMS.magnification;
    }

    /////// 速度の計算 ///////

    // 衝突をリストアップ
    const collisions: number[][] = [];
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dist = distance(particles[i], particles[j]);
            if (dist <= 2.0 * PARAMS.radius) {
                collisions.push([i, j, dist]);
            }

            // 万有引力の処理を入れるならココに
            // hogehoge

        }
        // 重力
        particles[i].velocity.y += PARAMS.gravity * Math.cos(Math.PI * PARAMS.gravity_direction);
        particles[i].velocity.x += PARAMS.gravity * Math.sin(Math.PI * PARAMS.gravity_direction);
    }

    // 距離が近い順にソート
    collisions.sort((a, b) => {
        return a[2] - b[2];
    });

    // 距離が近い順に衝突を処理
    for (const collision of collisions) {
        const a = particles[collision[0]];
        const b = particles[collision[1]];
        collide(a, b);
    }

    // 壁にぶつかったときの処理
    for (const particle of particles) {
        if (particle.position.x < PARAMS.radius && particle.velocity.x < 0 ||
            particle.position.x > PARAMS.width - PARAMS.radius && particle.velocity.x > 0) {
            particle.velocity.x *= - PARAMS.cor_wall;
        }
        if (particle.position.y < PARAMS.radius && particle.velocity.y < 0 ||
            particle.position.y > PARAMS.height - PARAMS.radius && particle.velocity.y > 0) {
            particle.velocity.y *= - PARAMS.cor_wall;
        }
    }
}

function distance(a: Particle, b: Particle): number {
    return Math.sqrt((a.position.x - b.position.x) ** 2 + (a.position.y - b.position.y) ** 2);
}

function collide(a: Particle, b: Particle): void {
    // aを基準に、bの相対速度を求める
    const rvab = b.velocity.sub(a.velocity);
    // abベクトル
    const ab = b.position.sub(a.position);
    // abベクトルを正規化
    const nab = ab.normalize();
    // 正規化したabとrvbの内積を出す（rvbのa方向の大きさが出る、a方向を向いている=scalarが負）
    // くっつくの防止で、いい感じの値とminをとる
    // const scalar =
    // Math.min(rvab.dot(nab) * PARAMS.cor, - PARAMS.radius * (1 / (2.3 * PARAMS.radius - distance(a, b)) ** 2));
    const scalar = Math.min(rvab.dot(nab) * PARAMS.cor, - 0.05);
    // rvbのa方向成分
    const rvaba = nab.scale(scalar);
    // 衝突後の速度の計算
    a.velocity = a.velocity.add(rvaba);
    b.velocity = b.velocity.sub(rvaba);
}

function initParticles(): void {
    particles = [];
    for (let i = 0; i < PARAMS.num_particle; i++) {
        particles.push(getParticle());
    }
}

function getParticle(): Particle {
    const p: Vec2 = new Vec2(Math.random() * 500, Math.random() * 500);
    const v: Vec2 = new Vec2((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
    return new Particle(p, v);
}
