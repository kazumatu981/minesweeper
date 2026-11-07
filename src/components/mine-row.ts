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

function formatMineRowId(rowId: number): string {
    return formatId(
        MINE_ROW_PREFIX,
        createRandomString(8, ID_CHARACTERS),
        rowId
    );
}
//#endregion

type MineGenerator = (rowId: number, colId: number) => Mine;

export interface MineRowConfig {
    rowId: number;
    size: number;
    mineGenerator: MineGenerator;
}

export class MineRow extends UiComponentWithChildrenBase<
    MineEvent,
    MineEvent,
    Mine
> {
    readonly #rowId;
    readonly #size;

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

    public get rowId(): number {
        return this.#rowId;
    }

    public get size(): number {
        return this.#size;
    }

    protected override onRightClick(): void {}
    protected override onLeftClick(): void {}
}
