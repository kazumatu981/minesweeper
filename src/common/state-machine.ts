import { EventHandler } from './event-handler.js';

type Resolver<TIn, TOut> = (x: TIn) => TOut;

export interface IStateMachine<TState> {
    get state(): TState;
}

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
> = {
    [K in TKey]: DecisionTable<TState, TObject, TState>;
};

export type StateMachineEvents = 'state-change';

export abstract class StateMachine<
    TEvents,
    TState extends string,
    TAction extends string,
>
    extends EventHandler<TEvents | StateMachineEvents>
    implements IStateMachine<TState>
{
    #state: TState;

    abstract transitionTable: DecisionTableDictionary<TAction, TState, this>;

    constructor(state: TState) {
        super();
        this.#state = state;
    }

    get state(): TState {
        return this.#state;
    }

    protected set state(value: TState) {
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change');
        }
    }

    protected goNextState(action: TAction) {
        this.state = this.transitionTable[action][this.state](this);
    }
}
