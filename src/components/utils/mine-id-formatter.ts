import { formatId, createRandomString } from '../../common/index.js';
import { MINE_PREFIX, MINE_ROW_PREFIX, MINE_FIELD_PREFIX } from './prefixes.js';

const CHARSET =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function _formatIdForMineObject(
    prefix: string,
    ...args: (string | number)[]
): string {
    return formatId(prefix, createRandomString(8, CHARSET), ...args);
}

export function formatMineId(rowId: number, fieldId: number): string {
    return _formatIdForMineObject(MINE_PREFIX, rowId, fieldId);
}

export function formatMineRowId(rowId: number): string {
    return _formatIdForMineObject(MINE_ROW_PREFIX, rowId);
}

export function formatMineFieldId(): string {
    return _formatIdForMineObject(MINE_FIELD_PREFIX);
}
