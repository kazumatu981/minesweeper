import { App } from './app/app.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new App({
        root: 'app-root',
        size: 10,
    });

    app.initialize();
    app.on('ready', () => {
        console.log('ready');
    });
});
