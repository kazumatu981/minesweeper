import { __assertBetween, EventHandler } from '../common/index.js';

import {
    type MineState,
    type MineEvent,
    MINE_BASE_CLASS,
    MINE_STATE_CLASSES,
    MINE_BOMB_CLASS,
    MINE_NEIGHBOR_CLASSES,
    formatMineId,
} from './utils/index.js';

//#region ローカル型やローカル定数
/**
 * UIイベント定義
 */
type UiEvent =
    /** タッチした */
    | 'touch'
    /** 右クリックした */
    | 'rClick'
    /**クリックした */
    | 'click';

//#region 状態やUIイベントをもとにした決定表
//#region table types
/**
 * Mineに関する述語関数
 */
type MinePredicate<T> = (mine: Mine) => T;
/**
 * Mineの状態に応じた述語関数決定テーブル
 */
type StateDecisionTable<T> = Record<MineState, MinePredicate<T>>;
/**
 * UIイベントとMineに応じた述語決定テーブル
 */
type UiEventStateDecisionTable<T> = Record<UiEvent, StateDecisionTable<T>>;
//#endregion
//#region table bodies
/**
 * クラスの決定
 */
const selectClasses: StateDecisionTable<string[]> = {
    closed: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.closed],
    mayBe: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.mayBe],
    mustBe: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.mustBe],
    opened: (mine) => [
        MINE_BASE_CLASS,
        MINE_STATE_CLASSES.opened,
        MINE_NEIGHBOR_CLASSES[mine.neighborCount]!,
    ],
    touched: (mine) => [
        MINE_BASE_CLASS,
        MINE_STATE_CLASSES.touched,
        MINE_NEIGHBOR_CLASSES[mine.neighborCount]!,
    ],
    bomb: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.bomb, MINE_BOMB_CLASS],
};
/**
 * Mineのテキストの決定
 */
const selectText: StateDecisionTable<string> = {
    closed: (_) => ' ',
    mayBe: (_) => '?',
    mustBe: (_) => 'F',
    opened: (mine) =>
        mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
    touched: (mine) =>
        mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
    bomb: (_) => 'B',
};
/**
 * 次の状態の決定
 */
const selectNextState: UiEventStateDecisionTable<MineState> = {
    touch: {
        closed: (mine) => (mine.isBomb ? 'closed' : 'touched'),
        mayBe: (_) => 'mayBe',
        mustBe: (_) => 'mustBe',
        opened: (_) => 'opened',
        bomb: (_) => 'bomb',
        touched: (_) => 'touched',
    },
    rClick: {
        closed: (_) => 'mustBe',
        mustBe: (_) => 'mayBe',
        mayBe: (_) => 'closed',
        opened: (_) => 'opened',
        bomb: (_) => 'bomb',
        touched: (_) => 'touched',
    },
    click: {
        closed: (mine) => (mine.isBomb ? 'bomb' : 'opened'),
        mayBe: (mine) => (mine.isBomb ? 'bomb' : 'opened'),
        mustBe: (_) => 'mustBe',
        opened: (_) => 'opened',
        bomb: (_) => 'bomb',
        touched: (_) => 'touched',
    },
};
//#endregion
//#endregion
//#endregion

export class Mine extends EventHandler<MineEvent> {
    readonly #element: HTMLElement;
    readonly #rowId;
    readonly #colId;
    #state: MineState = 'closed';
    #neighborBombCount = 0;
    #isBomb = false;

    public constructor(rowId: number, colId: number) {
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

    //#region Properties

    public get rowId(): number {
        return this.#rowId;
    }
    public get colId(): number {
        return this.#colId;
    }
    /**
     * idを参照する
     */
    get id(): string {
        return formatMineId(this.#rowId, this.#colId);
    }

    public get state(): MineState {
        return this.#state;
    }
    private set state(value: MineState) {
        // 以前の値と異なる場合のみ値をセットする
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change');
        }
    }
    set __unsafeState(value: MineState) {
        this.#state = value;
    }
    /**
     * DOM要素の参照
     */
    get element(): HTMLElement {
        return this.#element;
    }

    /**
     * 爆弾かどうかを取得する
     */
    public get isBomb(): boolean {
        return this.#isBomb;
    }
    /**
     * 爆弾かどうかを設定する
     */
    public set isBomb(value: boolean) {
        this.#isBomb = value;
    }

    /**
     * 近隣の爆弾の数を参照する
     */
    public get neighborCount(): number {
        return this.#neighborBombCount;
    }
    /**
     * 近隣の爆弾の数を設定する
     */
    public set neighborCount(value: number) {
        // 数値で範囲に収まっているか
        __assertBetween(value, 0, 9);

        this.#neighborBombCount = value;
    }

    /**
     * CSSクラスを参照する
     */
    get classes(): string[] {
        return selectClasses[this.state](this);
    }

    /**
     * 表面テキストを参照する
     */
    get text(): string {
        return selectText[this.state](this);
    }

    //#endregion

    //#endregion

    touch() {
        this.state = selectNextState['touch'][this.state](this);
    }

    //#region Very Private Zone !!!!!! these methods are encapsulated
    /**
     * イベント登録
     */
    #registerEvent() {
        // 右クリックの登録
        this.#element.addEventListener('click', () => {
            this.#onLeftClick();
        });
        // 左クリックの登録
        this.#element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this.#onRightClick();
        });

        // スタイル変更イベントの登録
        this.on('state-change', (thisObject: Mine) => {
            thisObject.#adjustFace();
        });

        // 爆弾通知
        this.on(
            'state-change',
            (thisObject: Mine) => thisObject.emit('bombed'),
            (thisObject: Mine) => thisObject.state === 'bomb'
        );

        // 開封通知
        this.on(
            'state-change',
            (thisObject: Mine) => thisObject.emit('opened'),
            (thisObject: Mine) => thisObject.state === 'opened'
        );
    }

    /**
     * 左クリックのイベントハンドラ
     */
    #onLeftClick() {
        this.state = selectNextState['click'][this.state](this);
    }
    /**
     * 右クリックのイベントハンドラ
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
        this.element.textContent = this.text;
        this.element.classList.add(...this.classes);
    }
    //#endregion
}
