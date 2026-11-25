import {
    __assertIsInteger,
    __assertBetween,
    EventDispatcher,
} from '../common/index.js';

type ScoreManagerEvents = 'score-reset' | 'score-changed';
export class ScoreManager extends EventDispatcher<ScoreManagerEvents> {
    /** 盤面のマス数 */
    #total: number = 0;
    /** 爆弾だと確定しているマス数 */
    #flagged: number = 0;
    /** 開封済み、または周辺の開封によりタッチされたマス数 */
    #estimated: number = 0;

    public constructor(total: number) {
        super();
        this.#total = total;
    }

    /** 盤面のマス数 */
    public get total(): number {
        return this.#total;
    }
    /** 爆弾だと確定しているマス数 */
    public get flagged(): number {
        return this.#flagged;
    }
    public set flagged(value: number) {
        __assertIsInteger(value);
        __assertBetween(value, 0, this.#total + 1);

        if (this.#flagged !== value) {
            this.#flagged = value;
            this.emit('score-changed', this);
        }
    }

    /** 開封済み、または周辺の開封によりタッチされたマス数 */
    public get estimated(): number {
        return this.#estimated;
    }
    public set estimated(value: number) {
        __assertIsInteger(value);
        __assertBetween(value, 0, this.#total + 1);

        if (this.#estimated !== value) {
            this.#estimated = value;
            this.emit('score-changed', this);
        }
    }
    /** 解決したマス数 */
    public get solved(): number {
        return this.flagged + this.estimated;
    }
    /** 未解決なマス数 */
    public get remained(): number {
        return this.total - this.solved;
    }

    /**
     * スコアをリセットする
     * @param total 合計のマス数
     * @returns このインスタンスそのもの
     */
    public reset(total: number): this {
        __assertIsInteger(total);
        __assertBetween(total, 0);

        this.#total = total;
        this.#flagged = 0;
        this.#estimated = 0;
        this.emit('score-reset', this);
        return this;
    }
}
