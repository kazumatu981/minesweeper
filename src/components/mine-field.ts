import {
    StateMachine,
    type StateActionHandler,
    type DecisionTableDictionary,
    getNeighbor,
    createRandomCoordinates,
    UiComponentWithChildrenBase,
} from '../common/index.js';
import {
    type MineEvent,
    type MineFieldEvent,
    type MineFieldState,
    MINE_FIELD_BASE_CLASS,
    formatMineFieldId,
} from './utils/index.js';
import { MineRow } from './mine-row.js';
import { Mine } from './mine.js';

type MineFieldAction = 'open-mine' | 'fail' | 'reset';

export interface MineFieldOptions {
    size: number;
    bombCount: number;
}

export class MineField extends UiComponentWithChildrenBase<
    MineFieldEvent,
    MineEvent,
    MineRow
> {
    #options: MineFieldOptions;
    readonly #stateMachine: StateMachine<
        MineFieldState,
        MineFieldAction,
        MineField
    >;

    public readonly transitionTable: DecisionTableDictionary<
        MineFieldAction,
        MineFieldState,
        this
    > = {
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

    public readonly stateActionHandlers: StateActionHandler<MineFieldState>[] =
        [
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
