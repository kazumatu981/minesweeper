import {
    StateMachine,
    StateAction,
    type DecisionTableDictionary,
    createRandom,
} from '../common/index.js';
import {
    type MineFieldEvent,
    type MineFieldState,
    MINE_FIELD_BASE_CLASS,
    formatMineFieldId,
} from './utils/index.js';
import { MineRow } from './mine-row.js';
import { type Mine } from './mine.js';

type MineFieldAction = 'open-mine' | 'fail' | 'reset';

interface MinePosition {
    rowId: number;
    colId: number;
}

function createMines(size: number, count: number): MinePosition[] {
    const mines: MinePosition[] = [];
    for (let i = 0; i < count; i++) {
        let rowId: number, colId: number;
        do {
            rowId = createRandom(0, size - 1);
            colId = createRandom(0, size - 1);
        } while (mines.some((m) => m.rowId === rowId && m.colId === colId));
        mines.push({ rowId, colId });
    }
    return mines;
}

export interface MineFieldOptions {
    size: number;
    mineCount: number;
}

export class MineField extends StateMachine<
    MineFieldEvent,
    MineFieldState,
    MineFieldAction
> {
    #options: MineFieldOptions;
    #rows: MineRow[] = [];
    readonly #element: HTMLDivElement;

    readonly transitionTable: DecisionTableDictionary<
        MineFieldAction,
        MineFieldState,
        this
    > = {
        'open-mine': {
            initialized: (field) => (field.isEnded ? 'ended' : 'started'),
            started: (field) => (field.isEnded ? 'ended' : 'started'),
            ended: (_) => 'ended',
        },
        fail: {
            initialized: (_) => 'ended',
            started: (_) => 'ended',
            ended: (_) => 'ended',
        },
        reset: {
            initialized: (_) => 'initialized',
            started: (_) => 'initialized',
            ended: (_) => 'initialized',
        },
    };

    readonly stateActions: StateAction<this, MineFieldState>[] = [
        {
            state: 'ended',
            action: (field) => field.emit('bombed'),
        },
    ];

    get isEnded(): boolean {
        // TODO
        return false;
    }
    constructor(options: MineFieldOptions) {
        super('initialized');

        this.#options = options;
        this.#element = this.#generateRoot();

        this.resetField(options.size, options.mineCount);

        this.on('opened', this.onOpened.bind(this));
    }

    get size(): number {
        return this.#options.size;
    }

    get rows(): MineRow[] {
        return this.#rows;
    }

    get mines(): Mine[] {
        return this.#rows.flatMap((row) => row.mines);
    }
    get element(): HTMLDivElement {
        return this.#element;
    }

    mine(rowId: number, colId: number): Mine {
        return this.#rows[rowId]!.mines[colId]!;
    }

    resetField(size: number, mineCount: number) {
        this.#options.size = size;
        this.#options.mineCount = mineCount;

        // 行をセットする
        this.#rows = this.#generateRows();

        // 爆弾をセットする
        this.#setMines();

        // イベントをセットする
        this.#setEvents();
    }

    onOpened(thisField: MineField, senderMine: unknown) {
        const neighbors = thisField.#getNeighborMines(senderMine as Mine);
        neighbors.forEach((mine) => {
            if (mine !== senderMine) {
                mine.touch();
            }
        });
    }

    #generateRoot(): HTMLDivElement {
        const fieldElement = document.createElement('div');
        fieldElement.id = formatMineFieldId();
        fieldElement.classList.add(MINE_FIELD_BASE_CLASS);
        return fieldElement;
    }
    #getNeighborMines(mine: Mine): Mine[] {
        const rowId = mine.rowId;
        const colId = mine.colId;
        const neighbors: Mine[] = [
            { rowId: rowId - 1, colId: colId - 1 },
            { rowId: rowId - 1, colId: colId },
            { rowId: rowId - 1, colId: colId + 1 },
            { rowId: rowId, colId: colId - 1 },
            { rowId: rowId, colId: colId },
            { rowId: rowId, colId: colId + 1 },
            { rowId: rowId + 1, colId: colId - 1 },
            { rowId: rowId + 1, colId: colId },
            { rowId: rowId + 1, colId: colId + 1 },
        ]
            .filter(
                ({ rowId: r, colId: c }) =>
                    r >= 0 &&
                    r < this.#options.size &&
                    c >= 0 &&
                    c < this.#options.size
            )
            .map(({ rowId: r, colId: c }) => this.mine(r, c));

        return neighbors;
    }
    #generateRows(): MineRow[] {
        // 行を作成する
        const rows: MineRow[] = Array.from({ length: this.#options.size }).map(
            (_, rowId) => new MineRow(rowId, this.#options.size)
        );

        this.element.replaceChildren();
        rows.forEach((row) => {
            this.element.appendChild(row.element);
        });

        return rows;
    }
    #setMines() {
        const minePositions = createMines(
            this.#options.size,
            this.#options.mineCount
        );
        minePositions.forEach(({ rowId, colId }) => {
            this.mine(rowId, colId).isBomb = true;
        });

        this.mines.forEach((mine) => {
            const neighborBombCount = this.#getNeighborMines(mine).filter(
                (m) => m.isBomb
            ).length;
            mine.neighborCount = neighborBombCount;
        });
    }
    #setEvents() {
        this.mines.forEach((mine) => {
            mine.on('bombed', (thisMine, ...args) => {
                this.emit('bombed', thisMine, ...args);
            });
            mine.on('opened', (thisMine, ...args) => {
                this.emit('opened', thisMine, ...args);
            });
        });
    }
}
