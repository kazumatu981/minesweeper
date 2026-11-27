import {
    __assertBetween,
    __assertIsDefined,
    __assertIsInteger,
    __assertEquals,
    UiComponentBase,
    formatClass,
    formatIdWithRandomSuffix,
} from '../common/index.js';
import { ScoreManager, type MineScore } from './score-manager.js';

export type ScoreboardEvent = 'score-changed';

const SCOREBOARD_PREFIX = '___scoreboard';

const LABELS: Record<keyof MineScore, string> = {
    flagged: 'Flagged',
    estimated: 'Estimated',
    remained: 'Remained',
    solved: 'Solved',
    total: 'Total',
    bomb: 'Bomb',
};

const SCOREBOARD_BASE_CLASS = formatClass(SCOREBOARD_PREFIX, 'base');
const SCOREBOARD_HEADER_BASE_CLASS = formatClass(
    SCOREBOARD_PREFIX,
    'header',
    'base'
);
const SCOREBOARD_VALUE_BASE_CLASS = formatClass(
    SCOREBOARD_PREFIX,
    'value',
    'base'
);

/**
 * MineScoreを表形式で表示するスコア盤。
 */
export class Scoreboard extends UiComponentBase<ScoreboardEvent> {
    readonly #cells = new Map<keyof MineScore, HTMLElement>();
    #manager: ScoreManager;

    /**
     * スコア盤を生成する。
     * @param mineField 指定した場合、MineFieldのscore-changedイベントに接続する
     */
    public constructor(manager: ScoreManager) {
        super({
            tagName: 'table',
            id: formatIdWithRandomSuffix(SCOREBOARD_PREFIX),
            classes: [SCOREBOARD_BASE_CLASS],
        });

        this.#manager = manager;
        this.#createTable();
        this.#connectToManager();
    }
    protected onScoreChanged(keys: (keyof MineScore)[]) {
        keys.forEach((key) => {
            const cell = this.#cells.get(key)!;
            cell.textContent = String(this.#manager[key]);
        });
    }

    protected override onLeftClick(): void {
        // スコア盤はクリック操作を受け付けない。
    }

    protected override onRightClick(): void {
        // スコア盤は右クリック操作を受け付けない。
    }

    #createTable(): void {
        const tableBody = this.element.ownerDocument.createElement('tbody');

        Object.keys(LABELS).forEach((key) => {
            const row = this.#createRow(key as keyof MineScore);
            tableBody.appendChild(row);
        });

        this.element.appendChild(tableBody);
    }

    #createRow(key: keyof MineScore): HTMLElement {
        const row = this.element.ownerDocument.createElement('tr');

        // ヘッダ
        const header = this.#createHeader(key);
        // 値
        const cell = this.#createValue(key);
        this.#cells.set(key, cell);

        // 行にヘッダと値をセットする
        row.append(header, cell);

        return row;
    }

    #createHeader(key: keyof MineScore): HTMLElement {
        const header = this.element.ownerDocument.createElement('th');
        header.classList.add(
            SCOREBOARD_HEADER_BASE_CLASS,
            formatClass(SCOREBOARD_PREFIX, 'header', key)
        );
        header.scope = 'row';
        header.textContent = LABELS[key];
        return header;
    }

    #createValue(key: keyof MineScore): HTMLElement {
        const cell = this.element.ownerDocument.createElement('td');
        cell.classList.add(
            SCOREBOARD_VALUE_BASE_CLASS,
            formatClass(SCOREBOARD_PREFIX, 'value', key)
        );
        cell.textContent = String(this.#manager[key]);
        return cell;
    }

    #connectToManager() {
        this.#manager.on('score-changed', (_manager, keys) => {
            this.onScoreChanged(keys as (keyof MineScore)[]);
        });
    }
}
