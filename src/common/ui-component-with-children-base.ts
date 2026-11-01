import {
    UiComponentBase,
    type UiComponentConfig,
} from './ui-component-base.js';

export type ChildGenerator<T> = (index: number) => T;

type EventMap<TParentEvent extends string, TChildEvent extends string> = {
    [K in TChildEvent]: TParentEvent | undefined;
};

export interface UiComponentWithChildrenConfig<
    TParentEvent extends string,
    TChildEvent extends string,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentConfig {
    childrenCount: number;
    generateChild: ChildGenerator<TChild>;
    eventMap?: EventMap<TParentEvent, TChildEvent>;
}
export abstract class UiComponentWithChildrenBase<
    TMyEvent extends string,
    TChildEvent extends string,
    TChild extends UiComponentBase<TChildEvent>,
> extends UiComponentBase<TMyEvent> {
    #children: TChild[] = [];
    readonly #generateChild: ChildGenerator<TChild>;
    readonly #eventMap: EventMap<TMyEvent, TChildEvent> | undefined;

    constructor(
        elementConfig: UiComponentWithChildrenConfig<
            TMyEvent,
            TChildEvent,
            TChild
        >
    ) {
        super(elementConfig);
        this.#generateChild = elementConfig.generateChild;
        this.#eventMap = elementConfig.eventMap;

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

        if (this.#eventMap) {
            // イベントを親にプロキシ
            Object.keys(this.#eventMap).forEach((childEvent) => {
                if (this.#eventMap![childEvent as TChildEvent]) {
                    children.forEach((child) => {
                        child.on(
                            childEvent as TChildEvent,
                            (thisChild, ...args) => {
                                this.emit(
                                    this.#eventMap![childEvent as TChildEvent]!,
                                    thisChild,
                                    ...args
                                );
                            }
                        );
                    });
                }
            });
        }

        return children;
    }
}
