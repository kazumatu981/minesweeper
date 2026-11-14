import {
    StateMachine,
    type StateMachineContext,
    type StateActionHandlers,
    type DecisionTableDictionary,
    getNeighbor,
    createRandomCoordinates,
    UiComponentWithChildrenBase,
    formatClass,
    formatId,
    createRandomString,
    type Coordinate,
    __assertBetween,
    __assertIsUndefined,
    __assertIsDefined,
} from '../common/index.js';
import { MineRow } from './mine-row.js';
import { Mine, type MineEvent } from './mine.js';

//#region 状態、イベント、アクションの定義
/**
 * MineFieldの状態定義
 */
export type MineFieldState = 'initialized' | 'started' | 'ended' | 'failed';
/**
 * MineFieldのイベント定義
 */
export type MineFieldEvent = MineEvent | 'score-changed';
/**
 * MineFieldアクション定義
 */
type MineFieldAction =
    /** 解答に近づいた */
    | 'resolve'
    /** 失敗した */
    | 'fail'
    /** リセットした */
    | 'reset';
/**
 * サイズの最大値
 */
const SIZE_MAX = 20;
//#endregion

//#region 識別子, クラス
const MINE_FIELD_PREFIX = '___mine_field';
const ID_CHARACTERS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
/**
 * 固有な識別子を作成する
 * @returns 識別子
 */
function formatMineFieldId(): string {
    return formatId(MINE_FIELD_PREFIX, createRandomString(8, ID_CHARACTERS));
}
/**
 * MineFieldCSSクラス名
 */
const MINE_FIELD_BASE_CLASS = formatClass(MINE_FIELD_PREFIX, 'base');
//#endregion

//#region MineFieldの設定
/**
 * Bombの位置
 */
export interface BombPosition {
    rowId: number;
    colId: number;
}
/**
 * MineFieldオプション
 */
export interface MineFieldOptions {
    size: number;
    bombCount?: number | undefined;
    bombs?: BombPosition[] | undefined;
}

function _coordinateToBombPosition(coordinate: Coordinate): BombPosition {
    return {
        rowId: coordinate.x,
        colId: coordinate.y,
    };
}
function __assertBombOptions(mineFieldOptions: MineFieldOptions) {
    __assertBetween(mineFieldOptions.size, 0, SIZE_MAX);
    if (mineFieldOptions.bombs !== undefined) {
        __assertIsUndefined(mineFieldOptions.bombCount);
        mineFieldOptions.bombs.forEach((bombPosition) => {
            __assertBetween(bombPosition.rowId, 0, mineFieldOptions.size);
            __assertBetween(bombPosition.colId, 0, mineFieldOptions.size);
        });
        __assertBetween(
            mineFieldOptions.bombs.length,
            0,
            mineFieldOptions.size * mineFieldOptions.size
        );
    } else {
        __assertIsDefined(mineFieldOptions.bombCount);
        __assertBetween(
            mineFieldOptions.bombCount!,
            0,
            mineFieldOptions.size * mineFieldOptions.size
        );
    }
}
function safeBomPositions(mineFieldOptions: MineFieldOptions): BombPosition[] {
    __assertBombOptions(mineFieldOptions);

    return (
        mineFieldOptions.bombs ??
        createRandomCoordinates(
            mineFieldOptions.size,
            mineFieldOptions.bombCount!
        ).map(_coordinateToBombPosition)
    );
}
//#endregion

//#region 状態遷移テーブル、状態アクションハンドラ (StateMachineContextの実装として使用する)
/**
 * 状態遷移テーブル
 */
type StateMachineTransitionTable = DecisionTableDictionary<
    MineFieldAction,
    MineFieldState,
    MineField
>;
/**
 * 状態に応じた述語関数決定テーブル
 */
type MineFieldStateActionHandlers = StateActionHandlers<MineFieldState>;
//#endregion

const eventMap = new Map<MineEvent, MineFieldEvent>([
    ['bombed', 'bombed'],
    ['resolved', 'resolved'],
    ['opened', 'opened'],
    ['state-change', 'state-change'],
]);
export class MineField
    extends UiComponentWithChildrenBase<MineFieldEvent, MineEvent, MineRow>
    implements StateMachineContext<MineFieldState, MineFieldAction, MineField>
{
    #options: MineFieldOptions;
    readonly #stateMachine: StateMachine<
        MineFieldState,
        MineFieldAction,
        MineField
    >;

    public readonly transitionTable: StateMachineTransitionTable = {
        resolve: {
            initialized: (field) => (field.isEnded ? 'ended' : 'started'),
            started: (field) => (field.isEnded ? 'ended' : 'started'),
            ended: (_) => 'ended',
            failed: (_) => 'failed',
        },
        fail: {
            initialized: (_) => 'failed',
            started: (_) => 'failed',
            ended: (_) => 'ended',
            failed: (_) => 'failed',
        },
        reset: {
            initialized: (_) => 'initialized',
            started: (_) => 'initialized',
            ended: (_) => 'initialized',
            failed: (_) => 'failed',
        },
    };

    public readonly stateActionHandlers: MineFieldStateActionHandlers = [
        {
            state: 'ended',
            action: (field) => (field as MineField).emit('resolved', field),
        },
        {
            state: 'failed',
            action: (field) => (field as MineField).emit('bombed', field),
        },
    ];

    public constructor(options: MineFieldOptions) {
        super({
            id: formatMineFieldId(),
            classes: [MINE_FIELD_BASE_CLASS],
            childrenCount: options.size,
            generateChild: (rowId) =>
                new MineRow({
                    rowId,
                    size: options.size,
                    mineGenerator: (rowId, colId) => new Mine(rowId, colId),
                }),
            eventMap,
        });

        this.#stateMachine = new StateMachine<
            MineFieldState,
            MineFieldAction,
            MineField
        >('initialized', this);

        this.#options = options;

        this.#registerEvents();

        this.#initialize();
    }

    public get size(): number {
        return this.#options.size;
    }

    public get rows(): readonly MineRow[] {
        return this.children;
    }

    public get mines(): Mine[] {
        return this.rows.flatMap((row) => row.children);
    }

    private get isEnded(): boolean {
        return this.estimated.length + this.flagged.length === this.totalCount;
    }

    public get totalCount(): number {
        return this.size * this.size;
    }
    public get flagged(): Mine[] {
        return this.mines.filter((mine) => mine.state === 'mustBe');
    }
    public get estimated(): Mine[] {
        return this.mines.filter(
            (mine) => mine.state === 'opened' || mine.state === 'touched'
        );
    }

    public mine(rowId: number, colId: number): Mine {
        return this.children[rowId]!.children[colId]!;
    }

    // TODO Refactor reset.....
    public resetField(options: MineFieldOptions): void {
        this.#options = options;
        this.resetChildren(this.#options.size);
        this.#initialize();
        // 爆弾をセットする
        this.#stateMachine.applyAction('reset');
    }

    public fail(_mine: Mine): void {
        this.#stateMachine.applyAction('fail');
    }
    public resolve(_mine: Mine): void {
        this.#stateMachine.applyAction('resolve');
    }
    public touchNeighbor(mine: Mine): void {
        this.#getNeighborMines(mine).forEach((m) => {
            if (m !== mine) {
                m.touch();
            }
        });
    }

    // TODO Refactor reset.....
    #initialize(): void {
        this.#resetMines();
        this.#setBombs();
        this.#adjustNeighborCount();
    }
    #resetMines(): void {
        this.mines.forEach((mine) => {
            mine.reset();
        });
    }
    #setBombs() {
        safeBomPositions(this.#options).forEach((position) => {
            this.mine(position.rowId, position.colId).isBomb = true;
        });
    }
    #adjustNeighborCount(): void {
        this.mines.forEach((mine) => {
            const neighborBombCount = this.#getNeighborMines(mine).filter(
                (m) => m.isBomb
            ).length;
            mine.neighborCount = neighborBombCount;
        });
    }

    #getNeighborMines(mine: Mine): Mine[] {
        return getNeighbor({ x: mine.rowId, y: mine.colId }, this.size).map(
            (coordinate) => this.mine(coordinate.x, coordinate.y)
        );
    }
    #registerEvents() {
        this.on('resolved', (mine) => this.resolve(mine as Mine));
        this.on('bombed', (mine) => this.fail(mine as Mine));
        this.on('opened', (mine) => this.touchNeighbor(mine as Mine));
    }

    protected override onRightClick(): void {}
    protected override onLeftClick(): void {}
}
