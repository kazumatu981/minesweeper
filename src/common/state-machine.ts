import {
    EventDispatcher,
    type EventPredicate,
    type EventCallback,
} from './events.js';

import { type DecisionTableDictionary } from './decision-table.js';

/**
 * ステートマシンに最低限必要な「状態変化イベント」
 */
export type StateMachineEvents = 'state-change';

/**
 * アクション定義
 */
export type StateActionHandler<TState> = {
    state: TState | TState[] | undefined;
    action: EventCallback;
};

export interface StateMachineContext<
    TState extends string,
    TAction extends string,
    TActionTo,
> {
    transitionTable: DecisionTableDictionary<TAction, TState, TActionTo>;
    stateActionHandlers: StateActionHandler<TState>[];
}

function is<TState>(
    state: TState | TState[] | undefined
): EventPredicate | undefined {
    if (state === undefined) {
        return undefined;
    }
    if (Array.isArray(state)) {
        return (o, ..._args) => state.includes((o as { state: TState }).state);
    } else {
        return (o, ..._args) => (o as { state: TState }).state === state;
    }
}

/**
 * 状態遷移を管理する抽象ステートマシン。
 *
 * @typeParam TEvents - このステートマシン固有のイベント名の型。
 * @typeParam TState - 状態名の型。現在の状態と遷移先を表す。
 * @typeParam TAction - 状態遷移を起こすアクション名の型。
 */
export class StateMachine<
    TState extends string,
    TAction extends string,
    TContext extends StateMachineContext<TState, TAction, TContext>,
> extends EventDispatcher<StateMachineEvents> {
    #initialState: TState;
    #state: TState;
    #context: TContext;

    constructor(initialState: TState, context: TContext) {
        super();
        this.#initialState = initialState;
        this.#state = initialState;
        this.#context = context;
        this.registerEvent();
    }

    get state(): TState {
        return this.#state;
    }

    reset(): void {
        this.state = this.#initialState;
    }

    protected set state(value: TState) {
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change', this);
        }
    }

    applyAction(action: TAction) {
        this.state = this.#context.transitionTable[action][this.state](
            this.#context
        );
    }

    protected registerEvent() {
        this.#context.stateActionHandlers?.forEach((action) =>
            this.on(
                'state-change',
                (_) => action.action(this.#context),
                is(action.state)
            )
        );
    }
}
