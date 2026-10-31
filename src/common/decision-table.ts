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
