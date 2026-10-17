import { EventHandler } from './event-handler.js';

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
export type DecisionTable<
    TState extends string,
    TObject extends IStateMachine<TState>,
    TOut,
> = {
    [K in TState]: Resolver<TObject, TOut>;
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
    TObject extends IStateMachine<TState>,
> = {
    [K in TKey]: DecisionTable<TState, TObject, TState>;
};
//#endregion

/**
 * ステートマシンに最低限必要な「状態変化イベント」
 */
export type StateMachineEvents = 'state-change';

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
