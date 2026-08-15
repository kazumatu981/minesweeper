import { EventHandler } from '../common/event-handler.js';

const MINE_ID_PREFIX = '___mine___';

const MINE_STATE_CLOSED = 'closed';
const MIME_STATE_ESTIMATED = 'estimated';
const MIME_STATE_MUST_BE_BOMB = 'must-be';
const MIME_STATE_MAY_BE_BOMB = 'may-be';
const MINE_STATE_OPENED = 'opened';

export const MINE_STATES = {
    /**
     * Mimeが閉じている
     */
    [MINE_STATE_CLOSED]: MINE_STATE_CLOSED,
    /**
     * Mimeの評価済みである
     */
    [MIME_STATE_ESTIMATED]: MIME_STATE_ESTIMATED,
    /**
     * BOMBだと思ってフラグを付けている状態
     */
    [MIME_STATE_MUST_BE_BOMB]: MIME_STATE_MUST_BE_BOMB,
    /**
     * BOMBかもしれない思ってフラグを付けている状態
     */
    [MIME_STATE_MAY_BE_BOMB]: MIME_STATE_MAY_BE_BOMB,
    /**
     * Mimeが開いている
     */
    [MINE_STATE_OPENED]: MINE_STATE_OPENED,
};

export class Mine extends EventHandler {
    _element;
    _rowId;
    _colId;
    _isBomb = false;

    constructor(rowId, colId) {
        super();
        this._rowId = rowId;
        this._colId = colId;

        this._element = document.createElement('div');
        this._element.id = this.id;
    }

    /**
     * 爆弾かどうかを取得する
     */
    get isBomb() {
        return this._isBomb;
    }

    /**
     * 爆弾かどうかを設定する
     */
    set isBomb(value) {
        this._isBomb = value;
    }

    get element() {
        return this._element;
    }

    get id() {
        return `${MINE_ID_PREFIX}${this._rowId}-${this._colId}`;
    }
}

export function _formatId(rowId, colId) {
    return `${MINE_ID_PREFIX}${rowId}-${colId}`;
}
