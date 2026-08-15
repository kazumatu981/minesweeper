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

const MIME_EVENT_STATE_CHANGE = 'state-change';
const MIME_EVENT_BOOM = 'boon';

export const MIME_EVENTS = {
    [MIME_EVENT_STATE_CHANGE]: MIME_EVENT_STATE_CHANGE,
    [MIME_EVENT_BOOM]: MIME_EVENT_BOOM,
};

export class Mine extends EventHandler {
    _element;
    _rowId;
    _colId;
    _state = MINE_STATES.closed;
    _neighborBombCount = 0;
    _isEstimated = false;
    _isBomb = false;

    constructor(rowId, colId) {
        super();
        this._rowId = rowId;
        this._colId = colId;

        this._element = document.createElement('div');
        this._element.id = this.id;
    }

    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
        this.on(MIME_EVENT_STATE_CHANGE, this);
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

    /**
     * 評価済みかどうかを取得する
     */
    get isEstimated() {
        return this._isEstimated;
    }
    /**
     * 評価済みかどうかを設定する
     */
    set isEstimated(value) {
        this._isEstimated = value;
    }

    /**
     * 近隣の爆弾の数を参照する
     */
    get neighborCount() {
        return this._neighborBombCount;
    }
    /**
     * 近隣の爆弾の数を設定する
     */
    set neighborCount(value) {
        this._neighborBombCount = value;
    }

    /**
     * DOM要素の参照
     */
    get element() {
        return this._element;
    }

    /**
     * idの参照
     */
    get id() {
        return _formatId(this._rowId, this._colId);
    }

    _registerEvent() {
        this._element.addEventListener('click', () => {
            this._onLeftClick();
        });
        this._element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this._onRightClick();
        });
    }

    /**
     * 左クリックのイベントハンドラ
     */
    _onLeftClick() {}
    /**
     * 右クリックの
     */
    _onRightClick() {}
}

export function _formatId(rowId, colId) {
    return `${MINE_ID_PREFIX}${rowId}-${colId}`;
}
