import {
    type StateMachineContext,
    type StateActionHandlers,
    type DecisionTableDictionary,
    StateMachine,
    UiComponentWithChildrenBase,
    formatClass,
    formatId,
    createRandomString,
    __assertBetween,
    __assertIsUndefined,
    __assertIsDefined,
} from '../common/index.js';
import {
    type MinesOption,
    type MinePosition,
    safeGetBomPositions,
} from './mine-position.js';
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
 * MineFieldオプション
 */
export interface MineFieldOptions extends MinesOption {
    size: number;
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

export interface MineScore {
    total: number;
    flagged: number;
    estimated: number;
}

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
            failed: (_) => 'initialized',
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
                    mineGenerator: (rowId, colId) =>
                        new Mine({ rowId, colId }, options.size),
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

        this.reset();
    }

    public get size(): number {
        return this.#options.size;
    }

    public get rows(): readonly MineRow[] {
        return this.children;
    }

    public get mines(): Mine[] {
        return this.children.flatMap((row) => row.children);
    }

    public get score(): MineScore {
        return {
            total: this.totalCount,
            flagged: this.flagged.length,
            estimated: this.estimated.length,
        };
    }

    private get isEnded(): boolean {
        const score = this.score;
        return score.estimated + score.flagged === score.total;
    }

    private get totalCount(): number {
        return this.size * this.size;
    }
    private get flagged(): Mine[] {
        return this.mines.filter((mine) => mine.state === 'mustBe');
    }
    private get estimated(): Mine[] {
        return this.mines.filter(
            (mine) => mine.state === 'opened' || mine.state === 'touched'
        );
    }

    public mine(position: MinePosition): Mine {
        return this.children[position.rowId]!.children[position.colId]!;
    }

    public reset(options?: MineFieldOptions): void {
        if (options) {
            this.#options = options;
            this.resetChildren(this.#options.size);
        }
        this.#initialize();
        // 爆弾をセットする
        this.#stateMachine.applyAction('reset');
    }

    public fail(_mine: Mine): void {
        this.#stateMachine.applyAction('fail');
        this.emit('score-changed', this);
    }
    public resolve(_mine: Mine): void {
        this.#stateMachine.applyAction('resolve');
        this.emit('score-changed', this);
    }
    public touch(mine: Mine): void {
        mine.neighborPositions
            .map((position) => this.mine(position))
            .filter((neighborMine) => neighborMine !== mine)
            .forEach((neighborMine) => {
                neighborMine.touch();
            });
    }

    #initialize(): void {
        // 盤面をリセットする
        this.mines.forEach((mine) => {
            mine.reset();
        });

        // Bombを設定する
        safeGetBomPositions(this.#options).forEach((position) => {
            this.mine(position).isBomb = true;
        });

        // 近隣のBombの個数を調整する
        this.mines.forEach((mine) => {
            mine.neighborCount = mine.neighborPositions
                .map((position) => this.mine(position))
                .filter((mine) => mine.isBomb).length;
        });
    }

    #registerEvents() {
        this.on('resolved', (mine) => this.resolve(mine as Mine));
        this.on('bombed', (mine) => this.fail(mine as Mine));
        this.on('opened', (mine) => this.touch(mine as Mine));
    }

    protected override onRightClick(): void {}
    protected override onLeftClick(): void {}
}
