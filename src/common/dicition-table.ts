export interface IStateMachine<TState> {
    get state(): TState;
    set state(value: TState);
}

export type Resolver<TIn, TOut> = (x: TIn) => TOut;

export type DecisionTable<
    TState extends string,
    TObject extends IStateMachine<TState>,
    TOut,
> = {
    [K in TState]: Resolver<TObject, TOut>;
};

export type DecisionTableDictionary<
    TKey extends string,
    TState extends string,
    TObject extends IStateMachine<TState>,
    TOut,
> = {
    [K in TKey]: DecisionTable<TState, TObject, TOut>;
};
