const MINE_STATE_CLOSED = 'closed';
const MINE_STATE_MUST_BE_BOMB = 'mustBe';
const MINE_STATE_MAY_BE_BOMB = 'mayBe';
const MINE_STATE_TOUCHED = 'touched';
const MINE_STATE_OPENED = 'opened';
const MINE_STATE_BOMB = 'bomb';

export type MineState =
    | 'closed'
    | 'mustBe'
    | 'mayBe'
    | 'opened'
    | 'touched'
    | 'bomb';

export const MINE_STATES: Record<MineState, string> = {
    /**
     * MINEが閉じている
     */
    [MINE_STATE_CLOSED]: MINE_STATE_CLOSED,
    /**
     * BOMBだと思ってフラグを付けている状態
     */
    [MINE_STATE_MUST_BE_BOMB]: MINE_STATE_MUST_BE_BOMB,
    /**
     * BOMBかもしれない思ってフラグを付けている状態
     */
    [MINE_STATE_MAY_BE_BOMB]: MINE_STATE_MAY_BE_BOMB,
    /**
     * MINEが開いている
     */
    [MINE_STATE_OPENED]: MINE_STATE_OPENED,
    /**
     * MINEがtouchであけられた状態
     */
    [MINE_STATE_TOUCHED]: MINE_STATE_TOUCHED,
    /**
     * MINEが開いていてBOMBの状態
     */
    [MINE_STATE_BOMB]: MINE_STATE_BOMB,
} as const;

const MINE_FIELD_STATE_INITIALIZED = 'initialized';
const MINE_FIELD_STATE_STARED = 'started';
const MINE_FIELD_STATE_ENDED = 'ended';

export type MineFieldState = 'initialized' | 'started' | 'ended';

export const MINE_FIELD_STATES: Record<MineFieldState, string> = {
    [MINE_FIELD_STATE_INITIALIZED]: MINE_FIELD_STATE_INITIALIZED,
    [MINE_FIELD_STATE_STARED]: MINE_FIELD_STATE_STARED,
    [MINE_FIELD_STATE_ENDED]: MINE_FIELD_STATE_ENDED,
} as const;
