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
    total: 'Total',
    estimated: 'Estimated',
    flagged: 'Flagged',
    remained: 'Remained',
};

const SCOREBOARD_BASE_CLASS = formatClass(SCOREBOARD_PREFIX, 'base');

/**
 * MineScoreを表形式で表示するスコア盤。
 */
export class Scoreboard extends UiComponentBase<ScoreboardEvent> {
    readonly #cells = new Map<keyof MineScore, HTMLTableCellElement>();
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

        this.#createTable();
        this.#manager = manager;
        this.#connectToManager();
    }
    protected onScoreChanged(keys: (keyof MineScore)[]) {
        keys.forEach((key) => {
            const cell = this.#cells.get(key)!;
            cell.textContent = String(this.#manager.score[key]);
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
        const header = this.element.ownerDocument.createElement('th');
        header.scope = 'row';
        header.textContent = LABELS[key];
        //TODO スタイルのクラスを設定する

        // 値
        const cell = this.element.ownerDocument.createElement('td');
        cell.textContent = '0';
        this.#cells.set(key, cell);
        //TODO スタイルのクラスを設定する

        // 行にヘッダと値をセットする
        row.append(header, cell);
        return row;
    }

    #connectToManager() {
        this.#manager.on('score-changed', (manager, keys) => {
            this.onScoreChanged(keys as (keyof MineScore)[]);
        });
    }
}
