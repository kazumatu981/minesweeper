import { EventHandler, createRandom } from '../common/index.js';
import { type MineFieldEvent, MINE_FIELD_BASE_CLASS } from './utils/index.js';
import { MineRow } from './mine-row.js';
import { type Mine } from './mine.js';

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

export class MineField extends EventHandler<MineFieldEvent> {
    #options: MineFieldOptions;
    #rows: MineRow[];
    #element: HTMLDivElement;

    constructor(options: MineFieldOptions) {
        super();

        this.#options = options;
        this.#rows = this.#generateRows();
        this.#element = this.#buildDomTree();
        this.#setMines();
    }

    get size(): number {
        return this.#options.size;
    }

    get rows(): MineRow[] {
        return this.#rows;
    }

    get element(): HTMLDivElement {
        return this.#element;
    }

    mine(rowId: number, colId: number): Mine {
        return this.#rows[rowId]!.mines[colId]!;
    }

    resize(size: number, mineCount: number) {
        this.#options.size = size;
        this.#options.mineCount = mineCount;

        this.#rows = this.#generateRows();
        this.#element = this.#buildDomTree();
        this.#setMines();
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
        const rows: MineRow[] = Array.from({ length: this.#options.size }).map(
            (_, rowId) => new MineRow(rowId, this.#options.size)
        );
        return rows;
    }
    #buildDomTree(): HTMLDivElement {
        const fieldElement = document.createElement('div');
        fieldElement.classList.add(MINE_FIELD_BASE_CLASS);

        this.#rows.forEach((row) => {
            fieldElement.appendChild(row.element);
        });

        return fieldElement;
    }
    #setMines() {
        const minePositions = createMines(
            this.#options.size,
            this.#options.mineCount
        );
        minePositions.forEach(({ rowId, colId }) => {
            this.mine(rowId, colId).setBomb();
        });

        this.#rows
            .flatMap((row) => row.mines)
            .forEach((mine) => {
                const neighborBombCount = this.#getNeighborMines(mine).filter(
                    (m) => m.isBomb
                ).length;
                mine.setNeighborCount(neighborBombCount);
            });
    }
}
