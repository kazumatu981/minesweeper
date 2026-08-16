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

//#region mine face and class
const MINE_CLASS_PREFIX = '__mine_';
const MINE_CLASS_BASE = '__mine_base';
const MINE_STATE_CLASSES = {
    /**
     * MINEが閉じている
     */
    [MINE_STATE_CLOSED]: {
        text: ' ',
        class: `${MINE_CLASS_PREFIX}${MINE_STATE_CLOSED}`,
    },
    /**
     * MINEの評価済みである
     */
    [MINE_STATE_ESTIMATED]: {
        text: 'E',
        class: `${MINE_CLASS_PREFIX}${MINE_STATE_ESTIMATED}`,
    },
    /**
     * BOMBだと思ってフラグを付けている状態
     */
    [MINE_STATE_MUST_BE_BOMB]: {
        text: 'F',
        class: `${MINE_CLASS_PREFIX}${MINE_STATE_MUST_BE_BOMB}`,
    },
    /**
     * BOMBかもしれない思ってフラグを付けている状態
     */
    [MINE_STATE_MAY_BE_BOMB]: {
        text: '?',
        class: `${MINE_CLASS_PREFIX}${MINE_STATE_MAY_BE_BOMB}`,
    },
    /**
     * MINEが開いている
     */
    [MINE_STATE_OPENED]: {
        text: ' ',
        class: `${MINE_CLASS_PREFIX}${MINE_STATE_OPENED}`,
    },
};
const MINE_IS_BOMB_CLASS = {
    text: 'B',
    class: `${MINE_CLASS_PREFIX}bomb`,
};
const MINE_NEIGHBOR_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((i) => {
        return {
            text: i.toString(),
            class: `${MINE_CLASS_PREFIX}neighbor${i}`,
        };
    })
    .reduce((prev, current) => {
        prev[current.text] = current;
        return prev;
    }, {});

const ALL_CLASSES = [
    MINE_IS_BOMB_CLASS,
    ...Object.values(MINE_STATE_CLASSES),
    ...Object.values(MINE_NEIGHBOR_CLASSES),
];
//#endregion

export class Mine extends EventHandler {
    _element;
    _rowId;
    _colId;
    _state;
    _neighborBombCount = 0;
    _isEstimated = false;
    _isBomb = false;

    constructor(rowId, colId) {
        super();
        this._rowId = rowId;
        this._colId = colId;

        this._element = document.createElement('div');
        this._element.id = this.id;
        this._element.classList.add(MINE_CLASS_BASE);
        this._registerEvent();

        this.state = MINE_STATE_CLOSED;
    }

    get state() {
        return this._state;
    }
    set state(value) {
        if (this._state !== value) {
            this._state = value;
            if (value === MINE_STATE_ESTIMATED) {
                this.isEstimated = true;
            }
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
        this.on(MINE_EVENT_STATE_CHANGE, this._checkBomb.bind(this));

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

    _checkBomb() {
        if (this.state === MINE_STATE_OPENED && this.isBomb) {
            this.fire(MINE_EVENT_BOOM, this);
        }
    }
    /**
     * テキストとスタイルの調整
     */
    _adjustFaceAndStyle() {
        // スタイルの初期化
        ALL_CLASSES.forEach((item) => {
            this._element.classList.remove(item.class);
        });

        this.element.textContent = this._currentStateClass.text;
        this.element.classList.add(this._currentStateClass.class);
        if (this.state === MINE_STATE_OPENED) {
            if (this.isBomb) {
                this.element.textContent = MINE_IS_BOMB_CLASS.text;
                this.element.classList.add(MINE_IS_BOMB_CLASS.class);
            }
        } else if (this.state === MINE_STATE_ESTIMATED) {
            const currentEstimated = MINE_NEIGHBOR_CLASSES[this.neighborCount];
            this.element.textContent = currentEstimated.text;
            this.element.classList.add(currentEstimated.class);
        }
    }

    get _currentStateClass() {
        return MINE_STATE_CLASSES[this.state];
    }
}

export function _formatId(rowId, colId) {
    return `${MINE_ID_PREFIX}${rowId}-${colId}`;
}

const R_CLICK_STATE_MAP = {
    [MINE_STATE_CLOSED]: MINE_STATE_MUST_BE_BOMB,
    [MINE_STATE_ESTIMATED]: MINE_STATE_MUST_BE_BOMB,
    [MINE_STATE_MUST_BE_BOMB]: MINE_STATE_MAY_BE_BOMB,
    [MINE_STATE_MAY_BE_BOMB]: MINE_STATE_CLOSED,
    [MINE_STATE_OPENED]: MINE_STATE_OPENED,
};
