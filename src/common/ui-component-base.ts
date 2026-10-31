import { EventHandler } from './event-handler.js';

export interface ElementConfig {
    tagName?: string;
    id: string;
    classes: string[];
}

export abstract class UiComponentBase<TEvent> extends EventHandler<TEvent> {
    #element: HTMLElement;

    constructor(elementConfig: ElementConfig) {
        super();

        const tagName = elementConfig.tagName ?? 'div';

        this.#element = document.createElement(tagName);
        this.#element.id = elementConfig.id;
        this.#element.classList.add(...elementConfig.classes);
    }

    get element(): HTMLElement {
        return this.#element;
    }

    get id(): string {
        return this.element.id;
    }
}
