import {
    StateMachine,
    type StateMachineContext,
    type StateActionHandlers,
    type DecisionTableDictionary,
    type StateMachineEvents,
    getNeighbor,
    createRandomCoordinates,
    UiComponentWithChildrenBase,
    formatClass,
    formatId,
    createRandomString,
} from '../common/index.js';
import { MineRow } from './mine-row.js';
import { Mine, type MineEvent } from './mine.js';

//#region MineFieldの識別子とクラス
const MINE_FIELD_PREFIX = '___mine_field';
const BASE_SUFFIX = 'base';
const ID_CHARACTERS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const MINE_FIELD_BASE_CLASS = formatClass(MINE_FIELD_PREFIX, BASE_SUFFIX);

function formatMineFieldId(): string {
    return formatId(MINE_FIELD_PREFIX, createRandomString(8, ID_CHARACTERS));
}
//#endregion

export type MineFieldEvent =
    | StateMachineEvents
    | 'score-changed'
    | 'resolved'
    | 'bombed';

export type MineFieldState = 'initialized' | 'started' | 'ended' | 'failed';

export const MINE_FIELD_STATES: Record<MineFieldState, string> = {
    initialized: 'initialized',
    started: 'started',
    ended: 'ended',
    failed: 'failed',
};

type MineFieldAction = 'open-mine' | 'fail' | 'reset';

export interface MineFieldOptions {
    size: number;
    bombCount: number;
}

type StateMachineTransitionTable = DecisionTableDictionary<
    MineFieldAction,
    MineFieldState,
    MineField
>;

type MineFieldStateActionHandlers = StateActionHandlers<MineFieldState>;
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
        'open-mine': {
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
                new MineRow({ rowId, size: options.size }),
        });

        this.#stateMachine = new StateMachine<
            MineFieldState,
            MineFieldAction,
            MineField
        >('initialized', this);

        this.#options = options;

        this.#resetRows(false);
    }

    public get size(): number {
        return this.#options.size;
    }
    public get bombCount(): number {
        return this.#options.bombCount;
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

    public resetField(size: number, bombCount: number): void {
        this.#options = { size, bombCount };
        this.#resetRows(true);
        // 爆弾をセットする
        this.#stateMachine.applyAction('reset');
    }

    public fail(_mine: Mine): void {
        this.#stateMachine.applyAction('fail');
    }
    public openMine(mine: Mine): void {
        this.#getNeighborMines(mine).forEach((m) => {
            if (m !== mine) {
                m.touch();
            }
        });
        this.#stateMachine.applyAction('open-mine');
    }

    #resetRows(rebuild: boolean): void {
        if (rebuild) {
            this.#buildField();
        }
        this.#setMinesEventListeners();
        this.#setBombs();
        this.#adjustNeighborCount();
    }

    #buildField(): void {
        this.resetChildren(this.#options.size);
    }
    #setMinesEventListeners(): void {
        this.mines.forEach((mine) => {
            mine.on('bombed', (m) => this.fail(m as Mine));
            mine.on('opened', (m) => this.openMine(m as Mine));
            mine.reset();
        });
    }

    #setBombs() {
        const { size, bombCount } = this.#options;
        createRandomCoordinates(size, bombCount).forEach((v) => {
            this.mine(v.x, v.y).isBomb = true;
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

    protected override onRightClick(): void {}
    protected override onLeftClick(): void {}
}
