const MINE_STATE_CLOSED = 'closed';
const MINE_STATE_TOUCHED = 'touched';
const MINE_STATE_MUST_BE_BOMB = 'mustBe';
const MINE_STATE_MAY_BE_BOMB = 'mayBe';
const MINE_STATE_OPENED = 'opened';
const MINE_STATE_BOMB = 'bomb';

export type MineState =
    | 'closed'
    | 'touched'
    | 'mustBe'
    | 'mayBe'
    | 'opened'
    | 'bomb';

export const MINE_STATES: Record<MineState, string> = {
    /**
     * MINEが閉じている
     */
    closed: MINE_STATE_CLOSED,
    /**
     * MINEは閉じているが評価された状態
     */
    touched: MINE_STATE_TOUCHED,
    /**
     * BOMBだと思ってフラグを付けている状態
     */
    mustBe: MINE_STATE_MUST_BE_BOMB,
    /**
     * BOMBかもしれない思ってフラグを付けている状態
     */
    mayBe: MINE_STATE_MAY_BE_BOMB,
    /**
     * MINEが開いている
     */
    opened: MINE_STATE_OPENED,
    /**
     * MINEが開いていてBOMBの状態
     */
    bomb: MINE_STATE_BOMB,
} as const;

// export type MineStates = keyof typeof MINE_STATES;
