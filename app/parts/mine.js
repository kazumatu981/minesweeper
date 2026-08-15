import {} from '../common/event-handler.js';

const MINE_ID_PREFIX = '___mine___';

export class Mine {
    _element;
    _rowId;
    _colId;

    constructor(rowId, colId) {
        this._rowId = rowId;
        this._colId = colId;

        this._element = document.createElement('div');
        this._element.id = this.id;
    }

    get element() {
        return this._element;
    }

    get id() {
        return `${MINE_ID_PREFIX}${this._rowId}-${this._colId}`;
    }
}

function _formatId(rowId, colId) {
    return `${MINE_ID_PREFIX}${rowId}-${colId}`;
}
