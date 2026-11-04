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
export type StateAction<TState> = {
    state: TState | TState[] | undefined;
    action: EventCallback;
};

function is<TState, TObject extends StateMachineLike<TState>>(
    state: TState | TState[] | undefined
): EventPredicate | undefined {
    if (state === undefined) {
        return undefined;
    }
    if (Array.isArray(state)) {
        return (o, ..._args) => state.includes((o as TObject).state);
    } else {
        return (o, ..._args) => (o as TObject).state === state;
    }
}

/**
 * ステートマシンに対する制約
 *
 * @typeParam TState - ステートマシンが現在保持する状態名の型。
 */
export interface StateMachineLike<TState> {
    /**
     * 状態を参照できること
     */
    get state(): TState;
}

export interface StateControllable<
    TState extends string,
    TAction extends string,
    TActionTo,
> {
    transitionTable: DecisionTableDictionary<TAction, TState, TActionTo>;
    stateActions: StateAction<TState>[];
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
    TActionTo extends StateControllable<TState, TAction, TActionTo>,
>
    extends EventDispatcher<StateMachineEvents>
    implements StateMachineLike<TState>
{
    #initialState: TState;
    #state: TState;
    #actionTo: TActionTo;

    constructor(initialState: TState, actionTo: TActionTo) {
        super();
        this.#initialState = initialState;
        this.#state = initialState;
        this.#actionTo = actionTo;
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

    goNextState(action: TAction, actionTo: TActionTo) {
        this.state =
            this.#actionTo.transitionTable[action][this.state](actionTo);
    }

    protected registerEvent() {
        this.#actionTo.stateActions?.forEach((action) =>
            this.on(
                'state-change',
                (_) => action.action(this.#actionTo),
                is(action.state)
            )
        );
    }
}
