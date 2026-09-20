import { EventHandler } from '../common/event-handler.js';
import { formatMineId } from './formatter.js';

//#region mine states
export const MINE_STATE_CLOSED = 'closed';
export const MINE_STATE_MUST_BE_BOMB = 'must-be';
export const MINE_STATE_MAY_BE_BOMB = 'may-be';
export const MINE_STATE_OPENED = 'opened';

export const MINE_STATES = {
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
const MINE_STATE_FACE = {
    /**
     * MINEが閉じている
     */
    [MINE_STATE_CLOSED]: {
        text: ' ',
        class: `${MINE_CLASS_PREFIX}${MINE_STATE_CLOSED}`,
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
const MINE_BOMB_FACE = {
    text: 'B',
    class: `${MINE_CLASS_PREFIX}bomb`,
};
const MINE_NEIGHBOR_FACE = [1, 2, 3, 4, 5, 6, 7, 8, 9]
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

const ALL_FACES = [
    MINE_BOMB_FACE,
    ...Object.values(MINE_STATE_FACE),
    ...Object.values(MINE_NEIGHBOR_FACE),
];
//#endregion

export class Mine extends EventHandler {
    #element;
    #rowId;
    #colId;
    #state;
    #neighborBombCount = 0;
    #isBomb = false;

    constructor(rowId, colId) {
        super();
        this.#rowId = rowId;
        this.#colId = colId;

        this.#element = document.createElement('div');
        this.#element.id = this.id;
        this.#element.classList.add(MINE_CLASS_BASE);
        this.#registerEvent();

        this.state = MINE_STATE_CLOSED;
    }

    get state() {
        return this.#state;
    }
    set state(value) {
        if (this.#state !== value) {
            this.#state = value;
            this.fire(MINE_EVENT_STATE_CHANGE, this);
        }
    }

    /**
     * 爆弾かどうかを取得する
     */
    get isBomb() {
        return this.#isBomb;
    }
    /**
     * 爆弾かどうかを設定する
     */
    set isBomb(value) {
        this.#isBomb = value;
    }

    /**
     * 近隣の爆弾の数を参照する
     */
    get neighborCount() {
        return this.#neighborBombCount;
    }
    /**
     * 近隣の爆弾の数を設定する
     */
    set neighborCount(value) {
        this.#neighborBombCount = value;
    }

    /**
     * DOM要素の参照
     */
    get element() {
        return this.#element;
    }

    /**
     * idの参照
     */
    get id() {
        return formatMineId(this.#rowId, this.#colId);
    }

    #registerEvent() {
        // DOM イベントの登録
        this.#element.addEventListener('click', () => {
            this.#onLeftClick();
        });
        this.#element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this.#onRightClick();
        });

        // 爆弾判定の登録
        this.on(MINE_EVENT_STATE_CHANGE, this.#checkBomb.bind(this));

        // スタイル変更イベントの登録
        this.on(MINE_EVENT_STATE_CHANGE, this.#adjustFace.bind(this));
    }

    /**
     * 左クリックのイベントハンドラ
     */
    #onLeftClick() {
        if ([MINE_STATE_CLOSED, MINE_STATE_MAY_BE_BOMB].includes(this.state)) {
            this.state = MINE_STATE_OPENED;
        }
    }
    /**
     * 右クリックの
     */
    #onRightClick() {
        this.state = R_CLICK_STATE_MAP[this.state];
    }

    #checkBomb() {
        if (this.state === MINE_STATE_OPENED && this.isBomb) {
            this.fire(MINE_EVENT_BOOM, this);
        }
    }
    /**
     * テキストとスタイルの調整
     */
    #adjustFace() {
        // スタイルの初期化
        ALL_FACES.forEach((item) => {
            this.#element.classList.remove(item.class);
        });

        const currentFace = this.currentFace;

        // 現在のテキストとクラスを設定する
        this.element.textContent = currentFace.text;
        currentFace.class.forEach((className) => {
            this.element.classList.add(className);
        });
    }

    get currentFace() {
        const currentFace = {
            text: MINE_STATE_FACE[this.state].text,
            class: [MINE_STATE_FACE[this.state].class],
        };
        if (this.state === MINE_STATE_OPENED) {
            if (this.isBomb) {
                currentFace.text = MINE_BOMB_FACE.text;
                currentFace.class.push(MINE_BOMB_FACE.class);
            } else if (this.neighborCount > 0) {
                const neighborFace = MINE_NEIGHBOR_FACE[this.neighborCount];
                currentFace.text = neighborFace.text;
                currentFace.class.push(neighborFace.class);
            }
        }
        return currentFace;
    }
}

const R_CLICK_STATE_MAP = {
    [MINE_STATE_CLOSED]: MINE_STATE_MUST_BE_BOMB,
    [MINE_STATE_MUST_BE_BOMB]: MINE_STATE_MAY_BE_BOMB,
    [MINE_STATE_MAY_BE_BOMB]: MINE_STATE_CLOSED,
    [MINE_STATE_OPENED]: MINE_STATE_OPENED,
};
