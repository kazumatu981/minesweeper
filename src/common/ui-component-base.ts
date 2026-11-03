import { EventHandler } from './event-handler.js';

export interface UiComponentConfig {
    tagName?: string;
    id: string;
    classes: string[];
}

export abstract class UiComponentBase<
    TEvent extends string,
> extends EventHandler<TEvent> {
    #element: HTMLElement;

    constructor(componentConfig: UiComponentConfig) {
        super();

        const tagName = componentConfig.tagName ?? 'div';

        this.#element = document.createElement(tagName);
        this.#element.id = componentConfig.id;
        this.#element.classList.add(...componentConfig.classes);

        this.#registerMouseEvent();
    }

    get element(): HTMLElement {
        return this.#element;
    }

    get id(): string {
        return this.element.id;
    }

    set text(value: string) {
        this.element.textContent = value;
    }
    get text(): string {
        return this.element.textContent ?? ' ';
    }

    get classes(): string[] {
        return Array.from(this.element.classList);
    }

    set classes(value: string[]) {
        this.element.classList.remove(...this.element.classList);
        this.element.classList.add(...value);
    }

    abstract onRightClick(): void;
    abstract onLeftClick(): void;

    #registerMouseEvent() {
        // 右クリックの登録
        this.element.addEventListener('click', () => {
            this.onLeftClick();
        });
        // 左クリックの登録
        this.element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this.onRightClick();
        });
    }
}
