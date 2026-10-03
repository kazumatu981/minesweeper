import { __assertBetween, EventHandler, formatId } from '../common/index.js';
import {
    type MineEvent,
    MINE_ROW_PREFIX,
    SIZE_MAX,
    MINE_ROW_BASE_CLASS,
} from './constants/index.js';
import { Mine } from './mine.js';

export class MineRow extends EventHandler<MineEvent> {
    readonly #element: HTMLElement;
    readonly #mines: Mine[];
    readonly #rowId;
    readonly #size;

    constructor(rowId: number, size: number) {
        super();

        __assertBetween(size, 0, SIZE_MAX);
        __assertBetween(rowId, 0, size - 1);

        this.#rowId = rowId;
        this.#size = size;

        this.#mines = this.#generateMines();
        this.#element = this.#buildDomTree();
        this.#proxyEvents();
    }

    get element(): HTMLElement {
        return this.#element;
    }

    get id(): string {
        return formatId(MINE_ROW_PREFIX, undefined, this.#rowId);
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

    #proxyEvents() {
        this.#mines.forEach((mine) => {
            mine.on('state-change', {
                action: (senderMine, ...args) => {
                    this.emit('state-change', senderMine, ...args);
                },
            });
            mine.on('boom', {
                action: (senderMine, ...args) => {
                    this.emit('boom', senderMine, ...args);
                },
            });
        });
    }
}
