import { Particle } from './particle';
import { Vec2 } from './vec2';

const RADIUS = 5;
const MAGNIFICATION = 1;
const COR = 0.95;
const COR_WALL = 0.95;
const NUM_PARTICLES = 1000;
const INTERVAL_MS = 10;

window.onload = (): void => {
    const container = document.getElementById('container');
    if (container) {
        main(container);
    }
};

function main(container: HTMLElement) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Context2D取得失敗');
    }
    const particles = getParticles(NUM_PARTICLES);

    window.setInterval(() => {
        refresh(ctx, canvas.width, canvas.height);
        particles.forEach((aparticl) => {
            draw_particle(aparticl, ctx);
        });
        step(particles, canvas.width, canvas.height);
    }, INTERVAL_MS);
}

function draw_particle(particle: Particle, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(particle.position.x, particle.position.y, RADIUS, 0, 2 * Math.PI, true);
    ctx.fill();
}

function refresh(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
}

// 相互作用の計算
function step(particles: Particle[], width: number, height: number): void {
    /////// 位置の計算 ///////

    for (const particle of particles) {
        particle.position.x += particle.velocity.x * MAGNIFICATION;
        particle.position.y += particle.velocity.y * MAGNIFICATION;
    }

    /////// 速度の計算 ///////

    // 衝突をリストアップ
    const collisions: number[][] = [];
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dist = distance(particles[i], particles[j]);
            if (dist <= RADIUS) {
                collisions.push([i, j, dist]);
            }

            // 万有引力の処理を入れるならココに
            // hogehoge

        }
        // 重力
        const hoge = 0.5; // 上手く描画するために適当に調整
        particles[i].velocity.y += 9.81 * (INTERVAL_MS / 1000) * hoge;
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
        if (particle.position.x < 0 && particle.velocity.x < 0 ||
            particle.position.x > width && particle.velocity.x > 0) {
            particle.velocity.x *= - COR_WALL;
        }
        if (particle.position.y < 0 && particle.velocity.y < 0 ||
            particle.position.y > height && particle.velocity.y > 0) {
            particle.velocity.y *= - COR_WALL;
        }
    }
}

function distance(a: Particle, b: Particle): number {
    return Math.sqrt((a.position.x - b.position.x) ** 2 + (a.position.y - b.position.y) ** 2);
}

function collide(a: Particle, b: Particle): void {
    // aを基準に、bの相対速度を求める
    const rvb = b.velocity.sub(a.velocity);
    // baベクトル
    const ba = b.position.sub(a.position);
    // baベクトルを正規化
    const nba = ba.normalize();
    // 正規化したbaとrvbの内積を出す（rvbのa方向の大きさが出る）
    const scalar = rvb.dot(nba) * COR;
    // rvbのa方向成分
    const rvba = nba.scale(scalar);
    // 衝突後の速度の計算
    a.velocity = a.velocity.add(rvba);
    b.velocity = b.velocity.sub(rvba);
}

function getParticles(num: number): Particle[] {
    const particles: Particle[] = [];
    for (let i = 0; i < num; i++) {
        particles.push(getParticle());
    }
    return particles;
}

function getParticle(): Particle {
    const p: Vec2 = new Vec2(Math.random() * 500, Math.random() * 500);
    const v: Vec2 = new Vec2((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    return new Particle(p, v);
}
