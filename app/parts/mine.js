import { EventHandler } from '../common/event-handler.js';

/**
 * MINEオブジェクトのIDプレフィックス
 */
const MINE_ID_PREFIX = '___mine___';

//#region mine states
const MINE_STATE_CLOSED = 'closed';
const MINE_STATE_ESTIMATED = 'estimated';
const MINE_STATE_MUST_BE_BOMB = 'must-be';
const MINE_STATE_MAY_BE_BOMB = 'may-be';
const MINE_STATE_OPENED = 'opened';

export const MINE_STATES = {
    /**
     * MINEが閉じている
     */
    [MINE_STATE_CLOSED]: MINE_STATE_CLOSED,
    /**
     * MINEの評価済みである
     */
    [MINE_STATE_ESTIMATED]: MINE_STATE_ESTIMATED,
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
};
//#endregion

//#region mine events
const MINE_EVENT_STATE_CHANGE = 'state-change';
const MINE_EVENT_BOOM = 'boon';

export const MINE_EVENTS = {
    [MINE_EVENT_STATE_CHANGE]: MINE_EVENT_STATE_CHANGE,
    [MINE_EVENT_BOOM]: MINE_EVENT_BOOM,
};
//#endregion

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
        if (this._state !== value) {
            this._state = value;
            this.fire(MINE_EVENT_STATE_CHANGE, this);
        }
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
        // DOM イベントの登録
        this._element.addEventListener('click', () => {
            this._onLeftClick();
        });
        this._element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this._onRightClick();
        });

        // 爆弾判定の登録
        this.on(MINE_EVENT_STATE_CHANGE, () => {
            if (this.isBomb) {
                this.fire(MINE_EVENT_BOOM, this);
            }
        });

        // スタイル変更イベントの登録
        this.on(MINE_EVENT_STATE_CHANGE, this._adjustFaceAndStyle.bind(this));
    }

    /**
     * 左クリックのイベントハンドラ
     */
    _onLeftClick() {
        if (
            [
                MINE_STATE_CLOSED,
                MINE_STATE_MAY_BE_BOMB,
                MINE_STATE_ESTIMATED,
            ].includes(this.state)
        ) {
            this.state = MINE_STATE_OPENED;
        }
    }
    /**
     * 右クリックの
     */
    _onRightClick() {
        let nextState = R_CLICK_STATE_MAP[this.state];
        if (nextState === MINE_STATE_CLOSED && this.isEstimated) {
            nextState = MINE_STATE_ESTIMATED;
        }
        this.state = nextState;
    }

    /**
     * テキストとスタイルの調整
     */
    _adjustFaceAndStyle() {
        // テキストの初期化
        // スタイルの初期化
    }
}

export function _formatId(rowId, colId) {
    return `${MINE_ID_PREFIX}${rowId}-${colId}`;
}

const R_CLICK_STATE_MAP = {
    [MINE_STATE_CLOSED]: MINE_STATE_MUST_BE_BOMB,
    [MINE_STATE_MUST_BE_BOMB]: MINE_STATE_MAY_BE_BOMB,
    [MINE_STATE_MAY_BE_BOMB]: MINE_STATE_CLOSED,
    [MINE_STATE_OPENED]: MINE_STATE_OPENED,
};
