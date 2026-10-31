import {
    __assertBetween,
    StateMachine,
    type DecisionTable,
    type DecisionTableDictionary,
    type StateAction,
    type StateControllable,
    UiComponentBase,
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

/**
 * UIイベント定義
 */
type MineAction =
    /** タッチした */
    | 'touch'
    /** 右クリックした */
    | 'rClick'
    /**クリックした */
    | 'click';

/**
 * Mineの状態に応じた述語関数決定テーブル
 */
type MineStateDecisionTable<T> = DecisionTable<MineState, T, Mine>;

export class Mine
    extends UiComponentBase<MineEvent>
    implements StateControllable<MineState, MineAction, Mine>
{
    readonly #rowId;
    readonly #colId;
    readonly #sateMachine: StateMachine<MineState, MineAction, Mine>;

    #neighborBombCount = 0;
    #isBomb = false;

    /**
     * クラスの決定
     */
    readonly classesDecisionTable: MineStateDecisionTable<string[]> = {
        closed: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.closed],
        mayBe: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.mayBe],
        mustBe: (_) => [MINE_BASE_CLASS, MINE_STATE_CLASSES.mustBe],
        opened: (mine) => [
            MINE_BASE_CLASS,
            MINE_STATE_CLASSES.opened,
            MINE_NEIGHBOR_CLASSES[mine.#neighborBombCount]!,
        ],
        touched: (mine) => [
            MINE_BASE_CLASS,
            MINE_STATE_CLASSES.touched,
            MINE_NEIGHBOR_CLASSES[mine.neighborCount]!,
        ],
        bomb: (_) => [
            MINE_BASE_CLASS,
            MINE_STATE_CLASSES.bomb,
            MINE_BOMB_CLASS,
        ],
    };
    /**
     * Mineのテキストの決定
     */
    readonly textDecisionTable: MineStateDecisionTable<string> = {
        closed: (_) => ' ',
        mayBe: (_) => '?',
        mustBe: (_) => 'F',
        opened: (mine) =>
            mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
        touched: (mine) =>
            mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
        bomb: (_) => 'B',
    };
    readonly transitionTable: DecisionTableDictionary<
        MineAction,
        MineState,
        Mine
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

    readonly stateActions: StateAction<MineState, Mine>[] = [
        {
            state: undefined,
            action: (mine: Mine) => mine.#adjustFace(),
        },
        {
            state: undefined,
            action: (mine: Mine) => mine.emit('state-change'),
        },
        {
            // 爆弾通知
            state: 'bomb',
            action: (mine: Mine) => mine.emit('bombed'),
        },
        {
            // 開封通知
            state: ['opened', 'touched'],
            action: (mine: Mine) => mine.emit('resolved'),
        },
        {
            // 開封通知
            state: ['opened'],
            action: (mine: Mine) => mine.emit('opened'),
        },
    ];

    public constructor(rowId: number, colId: number) {
        // 親クラスのコンストラクタ
        super({
            id: formatMineId(rowId, colId),
            classes: [],
        });
        this.#sateMachine = new StateMachine<MineState, MineAction, Mine>(
            'closed',
            this
        );
        this.#rowId = rowId;
        this.#colId = colId;

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

    public get state(): MineState {
        return this.#sateMachine.state;
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
        return this.classesDecisionTable[this.#sateMachine.state](this);
    }

    /**
     * 表面テキストを参照する
     */
    get text(): string {
        return this.textDecisionTable[this.#sateMachine.state](this);
    }

    //#endregion

    //#endregion

    touch() {
        this.#sateMachine.goNextState('touch', this);
    }

    /**
     * 左クリックのイベントハンドラ
     */
    override onLeftClick() {
        this.#sateMachine.goNextState('click', this);
    }
    /**
     * 右クリックのイベントハンドラ
     */
    override onRightClick() {
        this.#sateMachine.goNextState('rClick', this);
    }

    //#region private methods
    /**
     * テキストとスタイルの調整
     */
    #adjustFace() {
        // テキストを設定
        this.element.textContent = this.text;
        // クラスを設定
        this.element.classList.remove(...this.element.classList);
        this.element.classList.add(...this.classes);
    }
    //#endregion
}
