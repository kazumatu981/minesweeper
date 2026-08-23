import { EventHandler } from '../common/event-handler.js';
import { Mine, MINE_EVENTS } from './mine.js';

/**
 * MineRowオブジェクトのIDプレフィックス
 */
const MINE_ROW_ID_PREFIX = '___mine_row___';
const MINE_ROW_CLASS_BASE = '__mine_row_base';

export class MineRow extends EventHandler {
    _element;
    _items = [];
    _rowId;
    _size;

    constructor(rowId, size) {
        super();
        this._rowId = rowId;
        this._size = size;

        this._generateChildren();
        this._resisterEvents();
        this._createDomTree();
    }
    get id() {
        return `${MINE_ROW_ID_PREFIX}${this._rowId}`;
    }

    get items() {
        return this._items;
    }

    _generateChildren() {
        for (let columnsId = 0; columnsId < this._size; columnsId++) {
            const item = new Mine(this._rowId, columnsId);
            this._items.push(item);
        }
    }

    _resisterEvents() {
        this._items.forEach((item) => {
            item.on(MINE_EVENTS.boon, (thisMine) => {
                this.fire(MINE_EVENTS.boon, thisMine);
            });
            item.on(MINE_EVENTS['state-change'], (thisMine) => {
                this.fire(MINE_EVENTS['state-change'], thisMine);
            });
        });
    }

    _createDomTree() {
        this._element = document.createElement('div');
        this._element.id = this.id;
        this._element.classList.add(MINE_ROW_CLASS_BASE);

        this.items.forEach((item) => {
            this._element.appendChild(item.element);
        });
    }
}
