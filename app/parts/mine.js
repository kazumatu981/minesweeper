import {
    __assertBetween,
    __assertIsBoolean,
    __assertIsNumber,
    __assertSomeOf,
} from '../common/assert.js';
import { MINE_STATES } from './mine_state.js';
import { EventHandler } from '../common/event-handler.js';
import { formatMineId } from './formatter.js';
import {
    MINE_BASE_CLASS,
    MINE_STATE_CLASSES,
    MINE_BOMB_CLASS,
    MINE_NEIGHBOR_CLASSES,
} from './mine_face.js';

//#region mine events
export const MINE_EVENT_STATE_CHANGE = 'state-change';
export const MINE_EVENT_BOOM = 'boom';

/**
 * MINEのイベントを表す定数
 */
export const MINE_EVENTS = {
    /**
     * MINEの状態が変化したときに発火するイベント
     */
    [MINE_EVENT_STATE_CHANGE]: MINE_EVENT_STATE_CHANGE,
    /**
     * MINEが爆発したときに発火するイベント
     */
    [MINE_EVENT_BOOM]: MINE_EVENT_BOOM,
};
//#endregion

export class Mine extends EventHandler {
    #element;
    #rowId = 0;
    #colId = 0;
    #state = MINE_STATES.closed;
    #neighborBombCount = 0;
    #isBomb = false;
    #isTouched = false;

    constructor(rowId, colId) {
        // 引数チェック
        __assertIsNumber(rowId);
        __assertIsNumber(colId);

        // 親クラスのコンストラクタ
        super();
        this.#rowId = rowId;
        this.#colId = colId;

        this.#element = document.createElement('div');
        this.#element.id = this.id;
        this.#registerEvent();

        // 表面を調整する
        this.#adjustFace();
    }

    get state() {
        return this.#state;
    }
    set state(value) {
        // 予約された値がセットされているか
        __assertSomeOf(value, Object.keys(MINE_STATES));

        // 以前の値と異なる場合のみ値をセットする
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
        // ブール値が設定されようとしているか
        __assertIsBoolean(value);

        this.#isBomb = value;
    }

    /**
     * チェックされたかどうかを取得する
     */
    get isTouched() {
        return this.#isTouched;
    }
    /**
     * チェックされたかどうかを設定する
     */
    set isTouched(value) {
        // ブール値が設定されようとしているか
        __assertIsBoolean(value);
        if (this.#isTouched !== value) {
            this.#isTouched = value;
            this.#adjustFace();
        }
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
        // 数値で範囲に収まっているか
        __assertIsNumber(value);
        __assertBetween(value, 0, 8);

        this.#neighborBombCount = value;
    }

    #selectFaceClasses = {
        [MINE_STATES.closed]: () => {
            const selected = [
                MINE_BASE_CLASS,
                MINE_STATE_CLASSES[MINE_STATES.closed],
            ];
            if (this.isTouched) {
                selected.push(MINE_NEIGHBOR_CLASSES[this.neighborCount]);
            }
            return selected;
        },
        [MINE_STATES.mayBe]: () => [
            MINE_BASE_CLASS,
            MINE_STATE_CLASSES[MINE_STATES.mayBe],
        ],
        [MINE_STATES.mustBe]: () => [
            MINE_BASE_CLASS,
            MINE_STATE_CLASSES[MINE_STATES.mustBe],
        ],
        [MINE_STATES.opened]: () => {
            const selected = [
                MINE_BASE_CLASS,
                MINE_STATE_CLASSES[MINE_STATES.opened],
            ];
            if (this.isBomb) {
                selected.push(MINE_BOMB_CLASS);
            }
            return selected;
        },
    };
    #selectFaceText = {
        [MINE_STATES.closed]: () =>
            this.isTouched ? this.neighborCount.toString() : ' ',
        [MINE_STATES.mayBe]: () => '?',
        [MINE_STATES.mustBe]: () => 'F',
        [MINE_STATES.opened]: () => (this.isBomb ? 'B' : ' '),
    };

    get faceClasses() {
        return this.#selectFaceClasses[this.state]();
    }

    get faceText() {
        return this.#selectFaceText[this.state]();
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
        if ([MINE_STATES.closed, MINE_STATES.mayBe].includes(this.state)) {
            this.state = MINE_STATES.opened;
        }
    }
    /**
     * 右クリックの
     */
    #onRightClick() {
        this.state = R_CLICK_STATE_MAP[this.state];
    }

    #checkBomb() {
        if (this.state === MINE_STATES.opened && this.isBomb) {
            this.fire(MINE_EVENT_BOOM, this);
        }
    }
    /**
     * テキストとスタイルの調整
     */
    #adjustFace() {
        // 表面テキストとクラスをクリア
        this.element.textContent = ' ';
        this.element.classList.remove(...this.element.classList);

        // テキストを設定
        this.element.textContent = this.faceText;
        this.element.classList.add(...this.faceClasses);
    }
}

const R_CLICK_STATE_MAP = {
    [MINE_STATES.closed]: MINE_STATES.mustBe,
    [MINE_STATES.mustBe]: MINE_STATES.mayBe,
    [MINE_STATES.mayBe]: MINE_STATES.closed,
    [MINE_STATES.opened]: MINE_STATES.opened,
};

export * from './mine_state.js';
