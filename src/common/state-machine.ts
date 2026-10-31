import {
    EventHandler,
    type EventPredicate,
    type EventAction,
} from './event-handler.js';

//#region Decision Table
/**
 * 入力値から出力値を決定する関数。
 *
 * @typeParam TIn - 決定関数に渡す入力の型。
 * @typeParam TOut - 決定関数が返す値の型。
 */
type Resolver<TIn, TOut> = (x: TIn) => TOut;
/**
 * 状態ごとの決定関数を保持するテーブル。
 *
 * @typeParam TState - テーブルのキーとなる状態名の型。
 * @typeParam TObject - 決定関数に渡すステートマシンの型。
 * @typeParam TOut - 決定関数が返す値の型。
 */
export type DecisionTable<TState extends string, TOut, TActionTo> = {
    [K in TState]: Resolver<TActionTo, TOut>;
};

/**
 * アクションごとの決定テーブルを保持する辞書。
 *
 * @typeParam TKey - 辞書のキーとなるアクション名の型。
 * @typeParam TState - 各決定テーブルのキーとなる状態名の型。
 * @typeParam TObject - 決定関数に渡すステートマシンの型。
 */
export type DecisionTableDictionary<
    TKey extends string,
    TState extends string,
    TActionTo,
> = {
    [K in TKey]: DecisionTable<TState, TState, TActionTo>;
};
//#endregion

/**
 * ステートマシンに最低限必要な「状態変化イベント」
 */
export type StateMachineEvents = 'state-change';

/**
 * アクション定義
 */
export type StateAction<TIn, TState> = {
    state: TState | TState[] | undefined;
    action: EventAction<TIn>;
};

function toPredicate<TObject extends IStateMachine<TState>, TState>(
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
    TActionTo,
>
    extends EventHandler<StateMachineEvents>
    implements IStateMachine<TState>
{
    #state: TState;
    #actionTo: TActionTo;

    transitionTable: DecisionTableDictionary<TAction, TState, TActionTo>;
    stateActions: StateAction<TActionTo, TState>[];

    constructor(
        initialState: TState,
        actionTo: TActionTo,
        transitionTable: DecisionTableDictionary<TAction, TState, TActionTo>,
        stateActions: StateAction<TActionTo, TState>[]
    ) {
        super();
        this.#state = initialState;
        this.#actionTo = actionTo;
        this.transitionTable = transitionTable;
        this.stateActions = stateActions;
        this.registerEvent();
    }

    get state(): TState {
        return this.#state;
    }

    goNextState(action: TAction, actionTo: TActionTo) {
        this.state = this.transitionTable[action][this.state](actionTo);
    }

    protected set state(value: TState) {
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change');
        }
    }

    protected registerEvent() {
        this.stateActions?.forEach((action) =>
            this.on(
                'state-change',
                (_) => action.action(this.#actionTo),
                toPredicate(action.state)
            )
        );
    }
}
