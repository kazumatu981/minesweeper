import { formatMineClass } from './formatter.js';
import { MINE_STATES } from './mine_state.js';

const BASE_SUB_PREFIX = 'base';
const STATE_SUB_PREFIX = 'state';
const NEIGHBOR_SUB_PREFIX = 'neighbor';
const BOMB_SUB_PREFIX = 'bomb';

/**
 * Mineの基底クラス
 */
export const MINE_BASE_CLASS = formatMineClass(BASE_SUB_PREFIX);

/**
 * 状態に対応するクラス
 */
export const MINE_STATE_CLASSES = Object.keys(MINE_STATES).reduce(
    (defines, state) => {
        defines[state] = formatMineClass(STATE_SUB_PREFIX, state);
        return defines;
    },
    {}
);

/**
 * 近隣の爆弾数を表すパネルのクラス
 */
export const MINE_NEIGHBOR_CLASSES = Array.from({ length: 9 }).reduce(
    (defines, _, index) => {
        defines[index] = formatMineClass(NEIGHBOR_SUB_PREFIX, index);
        return defines;
    },
    {}
);

/**
 * 爆弾パネルのクラス
 */
export const MINE_BOMB_CLASS = formatMineClass(BOMB_SUB_PREFIX);
