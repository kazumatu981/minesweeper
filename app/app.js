import { EventHandler } from './common/event-handler.js';

export class App extends EventHandler {
    _config;
    constructor(config) {
        super();
        this._config = config;
    }
    initialize() {}
}
