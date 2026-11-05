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
    TChildEvent extends string,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentConfig {
    /** 生成する子コンポーネントの数です。 */
    childrenCount: number;
    /** インデックスを受け取り、子コンポーネントを生成する関数です。 */
    generateChild: ChildGenerator<TChild>;
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

    /** 子コンポーネントを生成する関数です。 */
    readonly #generateChild: ChildGenerator<TChild>;

    /**
     * 設定に基づいてコンポーネントと子コンポーネントを初期化します。
     *
     * @param elementConfig - DOM 要素と子コンポーネントの生成に使う設定です。
     */
    constructor(
        elementConfig: UiComponentWithChildrenConfig<TChildEvent, TChild>
    ) {
        super(elementConfig);

        this.#generateChild = elementConfig.generateChild;

        this.resetChildren(elementConfig.childrenCount);
    }

    /** このコンポーネントが持つ子コンポーネントの一覧です。 */
    get children(): readonly TChild[] {
        return this.#children;
    }

    /**
     * 子コンポーネントを指定した数だけ生成し直します。
     *
     * @param childrenCount - 生成する子コンポーネントの数です。
     */
    public resetChildren(childrenCount: number): void {
        const children = this.generateChildren(childrenCount);

        this.#children.splice(0);
        children.forEach((child) => {
            this.#children.push(child);
        });
    }

    /**
     * 子コンポーネントを生成して DOM 要素に追加します。
     *
     * @param childrenCount - 生成する子コンポーネントの数です。
     * @returns 生成した子コンポーネントの一覧です。
     */
    protected generateChildren(childrenCount: number): TChild[] {
        const children = Array.from({ length: childrenCount }).map((_, index) =>
            this.#generateChild(index)
        );

        this.element.replaceChildren();

        children.forEach((child) => {
            this.element.appendChild(child.element);
        });

        return children;
    }
}
