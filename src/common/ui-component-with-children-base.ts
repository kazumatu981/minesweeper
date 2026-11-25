import {
    UiComponentBase,
    type UiComponentConfig,
} from './ui-component-base.js';

export type ChildGenerator<T> = (index: number) => T;

/**
 * 子コンポーネントを持つ UI コンポーネントの設定です。
 *
 * @typeParam TChildEvent - 子コンポーネントが扱うイベント名の型です。
 * @typeParam TChild - 生成する子コンポーネントの型です。
 */
export interface UiComponentWithChildrenConfig<
    TMyEvent extends string,
    TChildEvent extends string,
> extends UiComponentConfig {
    /** 生成する子コンポーネントの数です。 */
    childrenCount: number;
    eventMap?: Map<TChildEvent, TMyEvent> | undefined;
}

/**
 * 子コンポーネントを生成し、DOM 要素に追加する UI コンポーネントの基底クラスです。
 *
 * @typeParam TMyEvent - このコンポーネントが扱うイベント名の型です。
 * @typeParam TChildEvent - 子コンポーネントが扱うイベント名の型です。
 * @typeParam TChild - このコンポーネントが持つ子コンポーネントの型です。
 */
export abstract class UiComponentWithChildrenBase<
    TMyEvent extends string,
    TChildEvent extends string,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentBase<TMyEvent> {
    /** このコンポーネントが持つ子コンポーネントの一覧です。 */
    #children: TChild[] = [];

    readonly #eventMap?: Map<TChildEvent, TMyEvent> | undefined;

    /**
     * 設定に基づいてコンポーネントと子コンポーネントを初期化します。
     *
     * @param elementConfig - DOM 要素と子コンポーネントの生成に使う設定です。
     */
    public constructor(
        elementConfig: UiComponentWithChildrenConfig<TMyEvent, TChildEvent>
    ) {
        super(elementConfig);

        this.#eventMap = elementConfig.eventMap;
    }

    /** このコンポーネントが持つ子コンポーネントの一覧です。 */
    public get children(): readonly TChild[] {
        return this.#children;
    }

    /**
     * コンポーネントの有効性を設定する。
     * 子コンポーネントまで有効性を設定する。
     */
    public override set enabled(value: boolean) {
        super.enabled = value;
        this.#children.forEach((child) => {
            child.enabled = value;
        });
    }
    public override get enabled(): boolean {
        return super.enabled;
    }
    /**
     * 子コンポーネントを指定した数だけ生成し直します。
     *
     * @param childrenCount - 生成する子コンポーネントの数です。
     */
    public resetChildren(childrenCount: number): void {
        const children = Array.from({ length: childrenCount }).map((_, index) =>
            this.generateChild(index)
        );

        // 要素のリセット
        this.#children.splice(0);
        children.forEach((child) => {
            this.#children.push(child);
        });

        // DOMのリセット
        this.element.replaceChildren();
        children.forEach((child) => {
            this.element.appendChild(child.element);
        });

        // イベントのマッピング
        children.forEach((child) => {
            this.#eventMap?.keys().forEach((childEvent) => {
                const myEvent = this.#eventMap!.get(childEvent)!;
                child.on(childEvent, (...args) => this.emit(myEvent, ...args));
            });
        });
    }

    protected abstract generateChild(index: number): TChild;
}
