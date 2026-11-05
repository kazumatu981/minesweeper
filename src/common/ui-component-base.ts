import { EventDispatcher } from './events.js';

/**
 * UI コンポーネントの要素を生成するための設定です。
 */
export interface UiComponentConfig {
    /** 生成する要素のタグ名。省略した場合は `div` です。 */
    tagName?: string;
    /** 生成する要素の ID です。 */
    id: string;
    /** 生成する要素に設定する CSS クラスです。 */
    classes: string[];
    /** 生成する要素に設定する初期テキストです。 */
    text?: string;
}

/**
 * DOM 要素を持つ UI コンポーネントの共通基底クラスです。
 *
 * @typeParam TEvent - このコンポーネントが扱うイベント名の型です。
 */
export abstract class UiComponentBase<
    TEvent extends string,
> extends EventDispatcher<TEvent> {
    #element: HTMLElement;

    /**
     * コンポーネントの DOM 要素を生成し、マウスイベントを登録します。
     *
     * @param componentConfig - 要素のタグ名、ID、CSS クラスの設定です。
     */
    public constructor(componentConfig: UiComponentConfig) {
        super();

        const tagName = componentConfig.tagName ?? 'div';

        this.#element = document.createElement(tagName);
        this.#element.id = componentConfig.id;
        this.#element.classList.add(...componentConfig.classes);
        if (componentConfig.text !== undefined) {
            this.#element.textContent = componentConfig.text;
        }

        this.#registerMouseEvent();
    }

    /** コンポーネントの DOM 要素です。 */
    public get element(): HTMLElement {
        return this.#element;
    }

    /** コンポーネントの DOM 要素の ID です。 */
    public get id(): string {
        return this.element.id;
    }

    /** コンポーネントの DOM 要素に設定するテキストです。 */
    public set text(value: string) {
        this.element.textContent = value;
    }

    /** コンポーネントの DOM 要素のテキストです。 */
    public get text(): string {
        return this.element.textContent ?? ' ';
    }

    /** コンポーネントの DOM 要素に設定されている CSS クラスです。 */
    public get classes(): string[] {
        return Array.from(this.element.classList);
    }

    /** コンポーネントの DOM 要素に設定する CSS クラスです。 */
    public set classes(value: string[]) {
        this.element.classList.remove(...this.element.classList);
        this.element.classList.add(...value);
    }

    /**
     * 右クリック時の処理を実装します。
     */
    protected abstract onRightClick(): void;

    /**
     * 左クリック時の処理を実装します。
     */
    protected abstract onLeftClick(): void;

    #registerMouseEvent() {
        // 左クリックの登録
        this.element.addEventListener('click', () => {
            this.onLeftClick();
        });
        // 右クリックの登録
        this.element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this.onRightClick();
        });
    }
}
