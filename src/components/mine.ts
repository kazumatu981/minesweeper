import {
    __assertBetween,
    StateMachine,
    type DecisionTable,
    type DecisionTableDictionary,
    type StateAction,
} from '../common/index.js';

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
 * Mineの状態に応じた述語関数決定テーブル
 */
type StateDecisionTable<T> = DecisionTable<MineState, Mine, T>;
//#endregion
//#region table bodies
/**
 * クラスの決定
 */
const classesDecisionTable: StateDecisionTable<string[]> = {
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
const textDecisionTable: StateDecisionTable<string> = {
    closed: (_) => ' ',
    mayBe: (_) => '?',
    mustBe: (_) => 'F',
    opened: (mine) =>
        mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
    touched: (mine) =>
        mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
    bomb: (_) => 'B',
};
//#endregion
//#endregion
//#endregion

export class Mine extends StateMachine<MineEvent, MineState, UiEvent> {
    readonly #element: HTMLElement;
    readonly #rowId;
    readonly #colId;
    #neighborBombCount = 0;
    #isBomb = false;

    readonly transitionTable: DecisionTableDictionary<
        UiEvent,
        MineState,
        this
    > = {
        touch: {
            closed: (mine: Mine) => (mine.isBomb ? 'closed' : 'touched'),
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
            closed: (mine: Mine) => (mine.isBomb ? 'bomb' : 'opened'),
            mayBe: (mine: Mine) => (mine.isBomb ? 'bomb' : 'opened'),
            mustBe: (_) => 'mustBe',
            opened: (_) => 'opened',
            bomb: (_) => 'bomb',
            touched: (_) => 'touched',
        },
    };

    readonly stateActions: StateAction<this, MineState>[] = [
        {
            state: undefined,
            action: (mine: Mine) => mine.#adjustFace(),
        },
        {
            // 爆弾通知
            state: 'bomb',
            action: (mine: Mine) => mine.emit('bombed'),
        },
        {
            // 開封通知
            state: 'opened',
            action: (mine: Mine) => mine.emit('opened'),
        },
    ];

    public constructor(rowId: number, colId: number) {
        // 親クラスのコンストラクタ
        super('closed');
        this.#rowId = rowId;
        this.#colId = colId;

        this.#element = document.createElement('div');
        this.#element.id = this.id;
        this.registerEvent();

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
        return classesDecisionTable[this.state](this);
    }

    /**
     * 表面テキストを参照する
     */
    get text(): string {
        return textDecisionTable[this.state](this);
    }

    //#endregion

    //#endregion

    touch() {
        this.goNextState('touch');
    }

    //#region Very Private Zone !!!!!! these methods are encapsulated
    /**
     * イベント登録
     */
    override registerEvent() {
        // 右クリックの登録
        this.#element.addEventListener('click', () => {
            this.#onLeftClick();
        });
        // 左クリックの登録
        this.#element.addEventListener('contextmenu', (domElement) => {
            domElement.preventDefault();
            this.#onRightClick();
        });

        // ステート変更イベントの登録
        super.registerEvent();
    }

    /**
     * 左クリックのイベントハンドラ
     */
    #onLeftClick() {
        this.goNextState('click');
    }
    /**
     * 右クリックのイベントハンドラ
     */
    #onRightClick() {
        this.goNextState('rClick');
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
