import { __assertBetween, EventHandler } from '../common/index.js';
import {
    type MineEvent,
    SIZE_MAX,
    MINE_ROW_BASE_CLASS,
    formatMineRowId,
} from './utils/index.js';
import { Mine } from './mine.js';

export class MineRow extends EventHandler<MineEvent> {
    readonly #element: HTMLElement;
    readonly #mines: Mine[];
    readonly #rowId;
    readonly #size;

    constructor(rowId: number, size: number) {
        __assertBetween(size, 0, SIZE_MAX);
        __assertBetween(rowId, 0, size - 1);

        super();

        this.#rowId = rowId;
        this.#size = size;

        this.#mines = this.#generateMines();
        this.#element = this.#buildDomTree();
    }

    get element(): HTMLElement {
        return this.#element;
    }

    get id(): string {
        return formatMineRowId(this.#rowId);
    }

    get mines() {
        return this.#mines;
    }

    #generateMines(): Mine[] {
        return Array.from({ length: this.#size }).map(
            (_, colId) => new Mine(this.#rowId, colId)
        );
    }

    #buildDomTree() {
        const root = document.createElement('div');
        root.id = this.id;
        root.classList.add(MINE_ROW_BASE_CLASS);

        this.#mines.forEach((item) => {
            root.appendChild(item.element);
        });
        return root;
    }
}
