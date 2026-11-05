import {
    __assertBetween,
    StateMachine,
    type DecisionTable,
    type DecisionTableDictionary,
    type StateActionHandler,
    type StateMachineContext,
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

type MineTransitionTable = DecisionTableDictionary<MineAction, MineState, Mine>;
type MineStateAction = StateActionHandler<MineState>;

export class Mine
    extends UiComponentBase<MineEvent>
    implements StateMachineContext<MineState, MineAction, Mine>
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
    readonly transitionTable: MineTransitionTable = {
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

    readonly stateActionHandlers: MineStateAction[] = [
        {
            state: undefined,
            action: (mine) => (mine as Mine).#adjustFace(),
        },
        {
            state: undefined,
            action: (mine) => (mine as Mine).emit('state-change', mine),
        },
        {
            // 爆弾通知
            state: 'bomb',
            action: (mine) => (mine as Mine).emit('bombed', mine),
        },
        {
            // 開封通知
            state: ['opened', 'touched'],
            action: (mine) => (mine as Mine).emit('resolved', mine),
        },
        {
            // 開封通知
            state: ['opened'],
            action: (mine) => (mine as Mine).emit('opened', mine),
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

    //#endregion

    public reset() {
        this.#sateMachine.reset();
        this.isBomb = false;
        this.neighborCount = 0;
        this.#adjustFace();
    }
    public touch() {
        this.#sateMachine.applyAction('touch');
    }

    /**
     * 左クリックのイベントハンドラ
     */
    override onLeftClick() {
        this.#sateMachine.applyAction('click');
    }
    /**
     * 右クリックのイベントハンドラ
     */
    override onRightClick() {
        this.#sateMachine.applyAction('rClick');
    }

    //#region private methods
    /**
     * テキストとスタイルの調整
     */
    #adjustFace() {
        // テキストを設定
        this.text = this.textDecisionTable[this.#sateMachine.state](this);
        // クラスを設定
        this.classes = this.classesDecisionTable[this.#sateMachine.state](this);
    }
    //#endregion
}
