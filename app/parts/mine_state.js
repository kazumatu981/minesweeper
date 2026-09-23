//#region mine states
export const MINE_STATE_CLOSED = 'closed';
export const MINE_STATE_TOUCHED = 'touched';
export const MINE_STATE_MUST_BE_BOMB = 'mustBe';
export const MINE_STATE_MAY_BE_BOMB = 'mayBe';
export const MINE_STATE_OPENED = 'opened';
export const MINE_STATE_BOMB = 'bomb';
/**
 * MINEの状態を表す定数
 */
export const MINE_STATES = {
    /**
     * MINEが閉じている
     */
    [MINE_STATE_CLOSED]: MINE_STATE_CLOSED,
    /**
     * MINEは閉じているが評価された状態
     */
    [MINE_STATE_TOUCHED]: MINE_STATE_TOUCHED,
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
     * MINEが開いていてBOMBの状態
     */
    [MINE_STATE_BOMB]: MINE_STATE_BOMB,
};
//#endregion
