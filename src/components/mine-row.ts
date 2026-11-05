import {
    __assertBetween,
    UiComponentWithChildrenBase,
} from '../common/index.js';
import {
    type MineEvent,
    SIZE_MAX,
    MINE_ROW_BASE_CLASS,
    formatMineRowId,
} from './utils/index.js';
import { Mine } from './mine.js';

export interface MineRowConfig {
    rowId: number;
    size: number;
}

export class MineRow extends UiComponentWithChildrenBase<
    MineEvent,
    MineEvent,
    Mine
> {
    readonly #rowId;
    readonly #size;

    public constructor(MineRowConfig: MineRowConfig) {
        const { rowId, size } = MineRowConfig;
        __assertBetween(size, 0, SIZE_MAX);
        __assertBetween(rowId, 0, size - 1);

        super({
            id: formatMineRowId(rowId),
            classes: [MINE_ROW_BASE_CLASS],
            childrenCount: size,
            generateChild: (colId) => new Mine(rowId, colId),
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
