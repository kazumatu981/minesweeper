import { MINE_PREFIX } from './prefixes.js';

function _format(prefix, suffix, separator, ...args) {
    const body = [...args].map((arg) => arg.toString()).join(separator);
    return [prefix, body, suffix]
        .filter((s) => s !== undefined)
        .join(separator);
}

function _formatId(prefix, ...args) {
    return _format(prefix, undefined, '-', ...args);
}

function _formatClass(prefix, ...args) {
    return _format(prefix, undefined, '_', args);
}

export function formatMineId(...args) {
    return _formatId(MINE_PREFIX, ...args);
}

export function formatMineClass(...args) {
    return _formatClass(MINE_PREFIX, ...args);
}
