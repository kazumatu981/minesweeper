import { formatClass } from '../../common/formatter.js';
import { MINE_PREFIX } from '../../common/prefixes.js';
import { type MineState, MINE_STATES } from './states.js';

const BASE_SUB_PREFIX = 'base';
const STATE_SUB_PREFIX = 'state';
const NEIGHBOR_SUB_PREFIX = 'neighbor';
const BOMB_SUFFIX = 'bomb';

/**
 * Mineの基底クラス
 */
export const MINE_BASE_CLASS = formatClass(
    MINE_PREFIX,
    undefined,
    BASE_SUB_PREFIX
);

/**
 * 状態に対応するクラス
 */
export const MINE_STATE_CLASSES = Object.fromEntries(
    (Object.keys(MINE_STATES) as MineState[]).map((state) => [
        state,
        formatClass(MINE_PREFIX, undefined, STATE_SUB_PREFIX, state),
    ])
) as Record<MineState, string>;
/**
 * 近隣の爆弾数を表すパネルのクラス
 */
export const MINE_NEIGHBOR_CLASSES: Record<number, string> = Array.from({
    length: 9,
}).reduce((defines: Record<number, string>, _, index) => {
    defines[index] = formatClass(
        MINE_PREFIX,
        undefined,
        NEIGHBOR_SUB_PREFIX,
        index.toString()
    );
    return defines;
}, {});

/**
 * 爆弾パネルのクラス
 */
export const MINE_BOMB_CLASS = formatClass(MINE_PREFIX, BOMB_SUFFIX);
