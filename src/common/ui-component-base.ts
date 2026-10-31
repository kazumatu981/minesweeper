import { EventHandler } from './event-handler.js';

export interface UiComponentConfig {
    tagName?: string;
    id: string;
    classes: string[];
}

export abstract class UiComponentBase<TEvent> extends EventHandler<TEvent> {
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

export type ChildGenerator<T> = (index: number) => T;
export interface UiComponentWithChildrenConfig<
    TChild,
> extends UiComponentConfig {
    childrenCount: number;
    generateChild: ChildGenerator<TChild>;
}
export abstract class UiComponentWithChildrenBase<
    TMyEvent,
    TChildEvent,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentBase<TMyEvent> {
    #children: TChild[] = [];
    readonly #generateChild: ChildGenerator<TChild>;

    constructor(elementConfig: UiComponentWithChildrenConfig<TChild>) {
        super(elementConfig);
        this.#generateChild = elementConfig.generateChild;

        this.resetChildren(elementConfig.childrenCount);
    }

    get children(): TChild[] {
        return this.#children;
    }

    public resetChildren(childrenCount: number): void {
        this.#children = this.generateChildren(childrenCount);
    }

    protected generateChildren(childrenCount: number): TChild[] {
        const children = Array.from({ length: childrenCount }).map((_, index) =>
            this.#generateChild(index)
        );

        this.element.replaceChildren();
        this.children.forEach((child) => {
            this.element.appendChild(child.element);
        });

        return children;
    }
}
