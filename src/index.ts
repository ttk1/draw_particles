import { Particle } from './particle';
import { Vec2 } from './vec2';

window.onload = (): void => {
    const container = document.getElementById('container');
    if (container) {
        main(container);
    }
};

function main(container: HTMLElement) {
    container.appendChild(createElement('h1', 'hello, world', null));
    container.appendChild(createElement('p', dummyText(100), null));
    const p: Vec2 = new Vec2(0.0, 0.0);
    const v: Vec2 = new Vec2(0.0, 0.0);
    const particle = new Particle(p, v);
}

function createElement(tagName: string, innerHTML: string, child: HTMLProgressElement | null): HTMLElement {
    const element = document.createElement(tagName);
    element.innerHTML = innerHTML;
    if (child) {
        element.appendChild(child);
    }
    return element;
}

function dummyText(length: number): string {
    let r = '';
    for (let i = 0; i < length; i++) {
        r += randomChar();
    }
    return r;
}

function randomChar(): string {
    return 'a';
}

