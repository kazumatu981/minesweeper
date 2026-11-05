import {
    EventDispatcher,
    type EventPredicate,
    type EventCallback,
} from './events.js';

import { type DecisionTableDictionary } from './decision-table.js';

/**
 * ステートマシンが発行するイベント名。
 */
export type StateMachineEvents = 'state-change';

/**
 * 指定した状態になったときに実行するアクションの定義。
 *
 * @typeParam TState - アクションの実行対象となる状態名の型。
 */
export type StateActionHandler<TState> = {
    /** アクションを実行する状態。未指定の場合はすべての状態が対象 */
    state: TState | TState[] | undefined;
    /** 状態変化時に実行する処理 */
    action: EventCallback;
};

/**
 * ステートマシンの遷移テーブルと状態別アクションを保持するコンテキスト。
 *
 * @typeParam TState - 状態名の型。
 * @typeParam TAction - アクション名の型。
 * @typeParam TActionTo - 遷移関数に渡すコンテキストの型。
 */
export interface StateMachineContext<
    TState extends string,
    TAction extends string,
    TActionTo,
> {
    /** アクションと現在の状態から遷移先を決定するテーブル */
    transitionTable: DecisionTableDictionary<TAction, TState, TActionTo>;
    /** 状態変化時に実行するアクションの一覧 */
    stateActionHandlers: StateActionHandler<TState>[];
}

/**
 * 対象の状態に一致するイベント判定関数を作成する。
 *
 * @typeParam TState - 比較する状態の型。
 * @param state - 一致させる状態、状態の一覧、または判定条件なしを表す `undefined`。
 * @returns 状態が一致するかを判定する関数。`state` が `undefined` の場合は `undefined`。
 */
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
 * @typeParam TState - 状態名の型。現在の状態と遷移先を表す。
 * @typeParam TAction - 状態遷移を起こすアクション名の型。
 * @typeParam TContext - 遷移テーブルと状態別アクションを含むコンテキストの型。
 */
export class StateMachine<
    TState extends string,
    TAction extends string,
    TContext extends StateMachineContext<TState, TAction, TContext>,
> extends EventDispatcher<StateMachineEvents> {
    /** 初期状態 */
    #initialState: TState;
    /** 現在の状態 */
    #state: TState;
    /** 状態遷移に使用するコンテキスト */
    #context: TContext;

    /**
     * ステートマシンを初期状態とコンテキストで初期化する。
     *
     * @param initialState - ステートマシンの初期状態。
     * @param context - 状態遷移テーブルと状態別アクションを含むコンテキスト。
     */
    constructor(initialState: TState, context: TContext) {
        super();
        this.#initialState = initialState;
        this.#state = initialState;
        this.#context = context;
        this.registerEvent();
    }

    /**
     * 現在の状態を取得する。
     *
     * @returns 現在の状態。
     */
    get state(): TState {
        return this.#state;
    }

    /**
     * ステートマシンを初期状態に戻す。
     */
    reset(): void {
        this.state = this.#initialState;
    }

    /**
     * 現在の状態を設定し、値が変わった場合は状態変化イベントを発行する。
     *
     * @param value - 設定する状態。
     */
    protected set state(value: TState) {
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change', this);
        }
    }

    /**
     * アクションを適用し、現在の状態に応じた遷移先へ移行する。
     *
     * @param action - 適用するアクション名。
     */
    applyAction(action: TAction) {
        this.state = this.#context.transitionTable[action][this.state](
            this.#context
        );
    }

    /**
     * コンテキストに定義された状態別アクションを状態変化イベントに登録する。
     */
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
