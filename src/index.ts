window.onload = (): void => {
    const container = document.getElementById('container');
    if (container) {
        container.appendChild(createElement(
            'p',
            'hello, world',
            null
        ));
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
