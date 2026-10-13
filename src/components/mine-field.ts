import { EventHandler } from '../common/index.js';
import { type MineFieldEvent } from './constants/events.js';
import { MineRow } from './mine-row.js';
import { type Mine } from './mine.js';

export class MineField extends EventHandler<MineFieldEvent> {
    #size: number;
    #rows: MineRow[];
    #element: HTMLDivElement;

    constructor(size: number) {
        super();

        this.#size = size;
        this.#rows = this.#generateRows();
        this.#element = this.#buildDomTree();
    }

    get size(): number {
        return this.#size;
    }

    get rows(): MineRow[] {
        return this.#rows;
    }

    get element(): HTMLDivElement {
        return this.#element;
    }

    getNeighborMines(mine: Mine): Mine[] {
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
                    r >= 0 && r < this.#size && c >= 0 && c < this.#size
            )
            .map(({ rowId: r, colId: c }) => this.#rows[r]!.mines[c]!);

        return neighbors;
    }
    #generateRows(): MineRow[] {
        const rows: MineRow[] = [];
        for (let i = 0; i < this.#size; i++) {
            const row = new MineRow(i, this.#size);
            rows.push(row);
        }
        return rows;
    }

    #buildDomTree(): HTMLDivElement {
        const fieldElement = document.createElement('div');
        fieldElement.classList.add('mine-field');
        return fieldElement;
    }
}
