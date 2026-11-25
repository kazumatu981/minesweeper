import {
    __assertBetween,
    __assertIsDefined,
    __assertIsInteger,
    __assertEquals,
    UiComponentBase,
    formatClass,
    formatId,
    createRandomString,
} from '../common/index.js';
import { type MineField, type MineScore } from './mine-field.js';

export type ScoreboardEvent = 'score-changed';

const SCOREBOARD_PREFIX = '___scoreboard';
const ID_CHARACTERS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function __assertMineScore(score: MineScore): void {
    __assertIsDefined(score);

    // 全て整数値？
    [score.total, score.estimated, score.flagged, score.remained].forEach(
        (value) => {
            __assertIsInteger(value);
        }
    );

    // 各値が範囲内？
    __assertBetween(score.total, 0, Number.MAX_SAFE_INTEGER);
    [score.estimated, score.flagged, score.remained].forEach((value) => {
        __assertBetween(value, 0, score.total);
    });

    // 各値の和がトータルに等しい？
    __assertEquals(
        score.flagged + score.estimated + score.remained,
        score.total
    );
}

/**
 * MineScoreを表形式で表示するスコア盤。
 */
export class Scoreboard extends UiComponentBase<ScoreboardEvent> {
    readonly #cells = new Map<keyof MineScore, HTMLTableCellElement>();
    #score: MineScore;
    #mineField: MineField | undefined;

    /**
     * スコア盤を生成する。
     * @param mineField 指定した場合、MineFieldのscore-changedイベントに接続する
     */
    public constructor(mineField?: MineField) {
        super({
            tagName: 'table',
            id: formatId(
                SCOREBOARD_PREFIX,
                createRandomString(8, ID_CHARACTERS)
            ),
            classes: [formatClass(SCOREBOARD_PREFIX, 'base')],
        });

        this.#score = {
            total: 0,
            flagged: 0,
            estimated: 0,
            remained: 0,
        };
        this.#createTable();

        if (mineField !== undefined) {
            this.connect(mineField);
        }
    }

    /**
     * 現在表示中のスコアを取得する。
     * @returns 表示中のスコア
     */
    public get score(): MineScore {
        return { ...this.#score };
    }

    /**
     * 表示するスコアを設定する。
     * @param value 新しいスコア
     */
    public set score(value: MineScore) {
        this.update(value);
    }

    /**
     * MineFieldに接続し、score-changedイベントをスコア盤へ反映する。
     * @param mineField 接続するMineField
     * @throws mineFieldが未定義の場合
     */
    public connect(mineField: MineField): void {
        __assertIsDefined(mineField);
        this.#mineField = mineField;
        this.update(mineField.score);
        mineField.on('score-changed', () => {
            if (this.#mineField === mineField) {
                this.update(mineField.score);
            }
        });
    }

    /**
     * スコア盤の表示を更新する。
     * @param score 更新するスコア
     * @throws スコアが負数または値の組み合わせが不正の場合
     */
    public update(score: MineScore): void {
        __assertMineScore(score);

        this.#score = { ...score };
        this.#cells.forEach((cell, key) => {
            cell.textContent = String(this.#score[key]);
        });
        this.emit('score-changed', this);
    }

    /**
     * スコア盤の表示を更新する。
     * @param score 更新するスコア
     */
    public updateScore(score: MineScore): void {
        this.update(score);
    }

    /**
     * MineFieldまたはMineScoreを指定して表示を更新する。
     * @param source 更新元
     * @throws 更新元が不正の場合
     */
    public updateFrom(source: MineField | MineScore): void {
        __assertIsDefined(source);
        if ('score' in source) {
            this.update(source.score);
            return;
        }
        this.update(source);
    }

    protected override onLeftClick(): void {
        // スコア盤はクリック操作を受け付けない。
    }

    protected override onRightClick(): void {
        // スコア盤は右クリック操作を受け付けない。
    }

    #createTable(): void {
        const tableBody = this.element.ownerDocument.createElement('tbody');
        const entries: [keyof MineScore, string][] = [
            ['total', 'Total'],
            ['flagged', 'Flagged'],
            ['estimated', 'Estimated'],
            ['remained', 'Remained'],
        ];

        entries.forEach(([key, label]) => {
            const row = this.element.ownerDocument.createElement('tr');
            const header = this.element.ownerDocument.createElement('th');
            const cell = this.element.ownerDocument.createElement('td');
            header.scope = 'row';
            header.textContent = label;
            cell.textContent = '0';
            cell.dataset.score = key;
            row.append(header, cell);
            tableBody.appendChild(row);
            this.#cells.set(key, cell);
        });

        this.element.appendChild(tableBody);
    }
}
