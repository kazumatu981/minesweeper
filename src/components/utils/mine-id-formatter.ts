import { formatId, createRandom } from '../../common/index.js';
import { MINE_PREFIX, MINE_ROW_PREFIX, MINE_FIELD_PREFIX } from './prefixes.js';

const CHARSET =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function _createRandomSuffix(length: number): string {
    return Array.from({ length })
        .map(() => {
            const randomIndex = createRandom(0, CHARSET.length - 1);
            return CHARSET[randomIndex];
        })
        .join('');
}

function _formatIdForMineObject(
    prefix: string,
    ...args: (string | number)[]
): string {
    return formatId(prefix, _createRandomSuffix(8), ...args);
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
