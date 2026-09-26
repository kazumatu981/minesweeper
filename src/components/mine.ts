import { __assertBetween } from '../common/assert.js';
import { type MineState } from './constants/states.js';
import { type MineEvent } from './constants/events.js';
import {
    MINE_BASE_CLASS,
    MINE_STATE_CLASSES,
    MINE_BOMB_CLASS,
    MINE_NEIGHBOR_CLASSES,
} from './constants/classes.js';

import { EventHandler } from '../common/event-handler.js';
import { formatId } from '../common/formatter.js';
import { MINE_PREFIX } from '../common/prefixes.js';

type MinePredicate<T> = (mine: Mine) => T;

const selectClasses: Record<MineState, MinePredicate<string[]>> = {
    closed: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.closed],
    touched: (mine) => [
        MINE_BASE_CLASS,
        MINE_STATE_CLASSES.touched,
        MINE_NEIGHBOR_CLASSES[mine.neighborCount] as string,
    ],
    mayBe: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.mayBe],
    mustBe: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.mustBe],
    opened: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.opened],
    bomb: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.bomb, MINE_BOMB_CLASS],
};
const selectFaceText: Record<MineState, MinePredicate<string>> = {
    closed: () => ' ',
    touched: (mine) => mine.neighborCount.toString(),
    mayBe: () => '?',
    mustBe: () => 'F',
    opened: () => ' ',
    bomb: () => 'B',
};

type UiEvents = 'touch' | 'rClick' | 'click';
const selectNextState: Record<
    UiEvents,
    Record<MineState, MinePredicate<MineState>>
> = {
    touch: {
        closed: () => 'touched',
        touched: () => 'touched',
        mayBe: () => 'mayBe',
        mustBe: () => 'mustBe',
        opened: () => 'opened',
        bomb: () => 'bomb',
    },
    rClick: {
        closed: () => 'mustBe',
        touched: () => 'mustBe',
        mayBe: (mine) => (mine.isTouched ? 'touched' : 'closed'),
        mustBe: () => 'mayBe',
        opened: () => 'opened',
        bomb: () => 'bomb',
    },
    click: {
        closed: (mine) => (mine.isBomb ? 'bomb' : 'opened'),
        touched: (mine) => (mine.isBomb ? 'bomb' : 'opened'),
        mayBe: (mine) => (mine.isBomb ? 'bomb' : 'opened'),
        mustBe: () => 'mustBe',
        opened: () => 'opened',
        bomb: () => 'bomb',
    },
};

export class Mine extends EventHandler<MineEvent> {
    readonly #element: HTMLElement;
    readonly #rowId;
    readonly #colId;
    #state: MineState = 'closed';
    #neighborBombCount = 0;
    #isBomb = false;
    #shouldEmitBoom = true;
    #isTouched = false;

    constructor(rowId: number, colId: number) {
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

    get state(): MineState {
        return this.#state;
    }
    set state(value: MineState) {
        // 以前の値と異なる場合のみ値をセットする
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change', this);
        }
    }

    /**
     * 爆弾かどうかを取得する
     */
    get isBomb(): boolean {
        return this.#isBomb;
    }
    /**
     * 爆弾かどうかを設定する
     */
    set isBomb(value: boolean) {
        this.#isBomb = value;
    }

    get shouldEmitBoon(): boolean {
        return this.#shouldEmitBoom;
    }
    set shouldEmitBoon(value: boolean) {
        this.#shouldEmitBoom = value;
    }

    /**
     * チェックされたかどうかを取得する
     */
    get isTouched(): boolean {
        return this.#isTouched;
    }
    /**
     * チェックされたかどうかを設定する
     */
    set isTouched(value: boolean) {
        if (this.#isTouched !== value) {
            this.#isTouched = value;
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
        __assertBetween(value, 0, 9);

        this.#neighborBombCount = value;
    }

    get faceClasses() {
        return selectClasses[this.state](this);
    }

    get faceText() {
        return selectFaceText[this.state](this);
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
        return formatId(MINE_PREFIX, undefined, this.#rowId, this.#colId);
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

        // スタイル変更イベントの登録
        this.on('state-change', {
            action: (thisObject: Mine) => {
                thisObject.#adjustFace();
            },
        });

        // 爆弾判定の登録
        this.on('state-change', {
            action: (thisObject: Mine) => {
                thisObject.emit('boom');
            },
            when: (thisObject: Mine) => {
                return thisObject.shouldEmitBoon && thisObject.state === 'bomb';
            },
        });
    }

    touch() {
        this.isTouched = true;
        this.state = selectNextState['touch'][this.state](this);
    }
    /**
     * 左クリックのイベントハンドラ
     */
    #onLeftClick() {
        this.state = selectNextState['click'][this.state](this);
    }
    /**
     * 右クリックの
     */
    #onRightClick() {
        this.state = selectNextState['rClick'][this.state](this);
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
