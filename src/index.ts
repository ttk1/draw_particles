window.onload = (): void => {
    const container = document.getElementById('container');
    if (container) {
        container.appendChild(createElement('h1', 'hello, world', null));
        container.appendChild(createElement('p', dummyText(100), null));
    }
};

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
