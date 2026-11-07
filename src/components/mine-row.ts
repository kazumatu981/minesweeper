import {
    __assertBetween,
    UiComponentWithChildrenBase,
    formatClass,
    formatId,
    createRandomString,
} from '../common/index.js';
import { Mine, type MineEvent } from './mine.js';

//#region MineRowの識別子・クラス・サイズ上限
const SIZE_MAX = 20;
const MINE_ROW_PREFIX = '___mine_row';
const BASE_SUFFIX = 'base';
const ID_CHARACTERS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const MINE_ROW_BASE_CLASS = formatClass(MINE_ROW_PREFIX, BASE_SUFFIX);

/**
 * MineRowの識別子を生成する。
 *
 * @param rowId 行番号
 * @returns 生成したMineRowの識別子
 */
function formatMineRowId(rowId: number): string {
    return formatId(
        MINE_ROW_PREFIX,
        createRandomString(8, ID_CHARACTERS),
        rowId
    );
}
//#endregion

/**
 * 指定した行番号と列番号からMineを生成する関数。
 */
type MineGenerator = (rowId: number, colId: number) => Mine;

/**
 * 1行分のMine配置を表す設定情報。
 */
export interface MineRowConfig {
    /** 行番号 */
    rowId: number;
    /** 行内のマス数 */
    size: number;
    /** 行の各マスを生成する関数 */
    mineGenerator: MineGenerator;
}

/**
 * 1行分のマインスイーパーのマスを管理するUIコンポーネント。
 */
export class MineRow extends UiComponentWithChildrenBase<
    MineEvent,
    MineEvent,
    Mine
> {
    /** 行番号 */
    readonly #rowId;
    /** 行内のマス数 */
    readonly #size;

    /**
     * MineRowを生成する。
     *
     * @param mineRowConfig 1行分の配置設定
     */
    public constructor(mineRowConfig: MineRowConfig) {
        const { rowId, size, mineGenerator } = mineRowConfig;
        __assertBetween(size, 0, SIZE_MAX);
        __assertBetween(rowId, 0, size - 1);

        super({
            id: formatMineRowId(rowId),
            classes: [MINE_ROW_BASE_CLASS],
            childrenCount: size,
            generateChild: (colId) => mineGenerator(rowId, colId),
        });
        this.#rowId = rowId;
        this.#size = size;
    }

    /**
     * 行番号を取得する。
     *
     * @returns 行番号
     */
    public get rowId(): number {
        return this.#rowId;
    }

    /**
     * 行内のマス数を取得する。
     *
     * @returns 行内のマス数
     */
    public get size(): number {
        return this.#size;
    }

    protected override onRightClick(): void {}
    protected override onLeftClick(): void {}
}
