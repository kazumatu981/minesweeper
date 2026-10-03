import { EventHandler } from '../../src/common/event-handler.js';
import { MineRow } from './mine_row.js';
import { MINE_EVENTS } from './mine.js';

/**
 * MineRowオブジェクトのIDプレフィックス
 */
const MINE_FIELD_ID = '___mine_field___';
const MINE_FIELD_CLASS_BASE = '__mine_field_base';

export class MineField extends EventHandler {
    _element;
    _size;
    _mineRows = [];

    constructor(size) {
        super();
        this._size = size;

        this._generateChildren();
        this._registerEvent();
        this._createDomTree();
    }

    get id() {
        return MINE_FIELD_ID;
    }
    get size() {
        return this._size;
    }

    _generateChildren() {
        for (let rowId = 0; rowId < this.size; rowId++) {
            const mineRow = new MineRow(rowId, this.size);
            this._mineRows.push(mineRow);
        }
    }
    _registerEvent() {
        this._mineRows.forEach((row) => {
            row.on(MINE_EVENTS.boom, (thisRow, thisMine) => {
                this.fire(MINE_EVENTS.boom, thisRow, thisMine);
            });
            row.on(MINE_EVENTS['state-change'], (thisRow, thisMine) => {
                this.fire(MINE_EVENTS['state-change'], thisRow, thisMine);
            });
        });
    }

    _createDomTree() {
        this._element = document.createElement('div');
        this._element.id = this.id;
        this._element.classList.add(MINE_FIELD_CLASS_BASE);

        this._mineRows.forEach((row) => {
            this._element.appendChild(row.element);
        });
    }

    getNeighborBombCount(centerRowId, centerColId) {
        return this.getNeighbors(centerRowId, centerColId).filter(
            (mine) => mine.isBomb
        ).length;
    }

    getNeighbors(centerRowId, centerColId) {
        return [
            { rowId: centerRowId - 1, colId: centerColId - 1 },
            { rowId: centerRowId - 1, colId: centerColId },
            { rowId: centerRowId - 1, colId: centerColId + 1 },

            { rowId: centerRowId, colId: centerColId - 1 },
            { rowId: centerRowId, colId: centerColId },
            { rowId: centerRowId, colId: centerColId + 1 },

            { rowId: centerRowId + 1, colId: centerColId - 1 },
            { rowId: centerRowId + 1, colId: centerColId },
            { rowId: centerRowId + 1, colId: centerColId + 1 },
        ]
            .map(({ rowId, colId }) => this.getMine(rowId, colId))
            .filter((mine) => mine !== null);
    }
    getMine(rowId, colId) {
        if (
            0 <= rowId &&
            rowId <= this.size - 1 &&
            0 <= colId &&
            colId <= this.size - 1
        ) {
            return this._unsafe_getMine(rowId, colId);
        }
        return null;
    }

    _unsafe_getMine(rowId, colId) {
        return this._mineRows[rowId].items[colId];
    }
}
