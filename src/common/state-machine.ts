import {
    EventHandler,
    type EventPredicate,
    type EventAction,
} from './event-handler.js';

import { type DecisionTableDictionary } from './decision-table.js';

/**
 * ステートマシンに最低限必要な「状態変化イベント」
 */
export type StateMachineEvents = 'state-change';

/**
 * アクション定義
 */
export type StateAction<TState, TActionTo> = {
    state: TState | TState[] | undefined;
    action: EventAction<TActionTo>;
};

function is<TState, TObject extends IStateMachine<TState>>(
    state: TState | TState[] | undefined
): EventPredicate<TObject> | undefined {
    if (state === undefined) {
        return undefined;
    }
    if (Array.isArray(state)) {
        return (o: TObject) => state.includes(o.state);
    } else {
        return (o: TObject) => o.state === state;
    }
}

/**
 * ステートマシンに対する制約
 *
 * @typeParam TState - ステートマシンが現在保持する状態名の型。
 */
export interface IStateMachine<TState> {
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
    stateActions: StateAction<TState, TActionTo>[];
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
    extends EventHandler<StateMachineEvents>
    implements IStateMachine<TState>
{
    #state: TState;
    #actionTo: TActionTo;

    constructor(initialState: TState, actionTo: TActionTo) {
        super();
        this.#state = initialState;
        this.#actionTo = actionTo;
        this.registerEvent();
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
