import {
    UiComponentBase,
    type UiComponentConfig,
} from './ui-component-base.js';

export type ChildGenerator<T> = (index: number) => T;

export interface UiComponentWithChildrenConfig<
    TChildEvent extends string,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentConfig {
    childrenCount: number;
    generateChild: ChildGenerator<TChild>;
}
export abstract class UiComponentWithChildrenBase<
    TMyEvent extends string,
    TChildEvent extends string,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentBase<TMyEvent> {
    #children: TChild[] = [];
    readonly #generateChild: ChildGenerator<TChild>;

    constructor(
        elementConfig: UiComponentWithChildrenConfig<TChildEvent, TChild>
    ) {
        super(elementConfig);

        this.#generateChild = elementConfig.generateChild;

        this.resetChildren(elementConfig.childrenCount);
    }

    get children(): TChild[] {
        return this.#children;
    }

    public resetChildren(childrenCount: number): void {
        console.log(`resetChildren: ${childrenCount} children for ${this.id}`);
        this.#children = this.generateChildren(childrenCount);
    }

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
