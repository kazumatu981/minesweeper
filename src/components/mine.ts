import {
    __assertBetween,
    StateMachine,
    type DecisionTable,
    type DecisionTableDictionary,
    type StateActionHandler,
    type StateMachineContext,
    type StateMachineEvents,
    UiComponentBase,
    formatClass,
    formatId,
    createRandomString,
} from '../common/index.js';

//#region 状態、イベント、アクションの定義
/**
 * Mineの状態定義
 */
export type MineState =
    | 'closed'
    | 'mustBe'
    | 'mayBe'
    | 'opened'
    | 'touched'
    | 'bomb';

/**
 * Mineのイベント定義
 */
export type MineEvent = StateMachineEvents | 'bombed' | 'opened' | 'resolved';

/**
 * Mineのアクション定義
 */
type MineAction =
    /** タッチした */
    | 'touch'
    /** 右クリックした */
    | 'rClick'
    /**クリックした */
    | 'click';
// #endregion

//#region 識別子, クラス
const MINE_PREFIX = '___mine';

//#region 識別子
const ID_CHARACTERS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function formatMineId(rowId: number, colId: number): string {
    return formatId(
        MINE_PREFIX,
        createRandomString(8, ID_CHARACTERS),
        rowId,
        colId
    );
}
//#endregion

//#region クラス
class MineClasses {
    public static readonly base = formatClass(MINE_PREFIX, 'base');
    public static readonly bomb = formatClass(MINE_PREFIX, 'bomb');
    public static neighbor(neighborCount: number): string {
        return formatClass(MINE_PREFIX, undefined, 'neighbor', neighborCount);
    }
    public static state(state: MineState): string {
        return formatClass(MINE_PREFIX, undefined, 'state', state);
    }
}
//#endregion

//#endregion

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
    public readonly classesDecisionTable: MineStateDecisionTable<string[]> = {
        closed: (_) => [MineClasses.base, MineClasses.state('closed')],
        mayBe: (_) => [MineClasses.base, MineClasses.state('mayBe')],
        mustBe: (_) => [MineClasses.base, MineClasses.state('mustBe')],
        opened: (mine) => [
            MineClasses.base,
            MineClasses.state('opened'),
            MineClasses.neighbor(mine.#neighborBombCount),
        ],
        touched: (mine) => [
            MineClasses.base,
            MineClasses.state('touched'),
            MineClasses.neighbor(mine.#neighborBombCount),
        ],
        bomb: (_) => [MineClasses.base, MineClasses.state('bomb')],
    };
    /**
     * Mineのテキストの決定
     */
    public readonly textDecisionTable: MineStateDecisionTable<string> = {
        closed: (_) => ' ',
        mayBe: (_) => '?',
        mustBe: (_) => 'F',
        opened: (mine) =>
            mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
        touched: (mine) =>
            mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
        bomb: (_) => 'B',
    };

    public readonly transitionTable: MineTransitionTable = {
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
    public readonly stateActionHandlers: MineStateAction[] = [
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
    protected override onLeftClick() {
        this.#sateMachine.applyAction('click');
    }
    /**
     * 右クリックのイベントハンドラ
     */
    protected override onRightClick() {
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
