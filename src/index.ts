window.onload = (): void => {
    const container = document.getElementById('container');
    if (container) {
        const p = document.createElement('p');
        p.innerHTML = 'hello, world';
        container.appendChild(p);
    }
};
