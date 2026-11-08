import {
    __assertBetween,
    StateMachine,
    type DecisionTable,
    type DecisionTableDictionary,
    type StateActionHandlers,
    type StateMachineContext,
    type StateMachineEvents,
    UiComponentBase,
    formatClass,
    formatId,
    createRandomString,
} from '../common/index.js';

//#region 状態、イベント、アクションの定義
/**
 * Mineの状態定義
 */
export type MineState =
    | 'closed'
    | 'mustBe'
    | 'mayBe'
    | 'opened'
    | 'touched'
    | 'bomb';

/**
 * Mineのイベント定義
 */
export type MineEvent = StateMachineEvents | 'bombed' | 'opened' | 'resolved';

/**
 * Mineのアクション定義
 */
type MineAction =
    /** タッチした */
    | 'touch'
    /** 右クリックした */
    | 'rClick'
    /**クリックした */
    | 'click'
    /** 初期状態に戻す */
    | 'reset';
// #endregion

//#region 識別子, クラス
const MINE_PREFIX = '___mine';

//#region 識別子
const ID_CHARACTERS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
/**
 * Mineの識別子を生成する。
 *
 * @param rowId 行番号
 * @param colId 列番号
 * @returns 行番号と列番号を含むMineの識別子
 */
function formatMineId(rowId: number, colId: number): string {
    return formatId(
        MINE_PREFIX,
        createRandomString(8, ID_CHARACTERS),
        rowId,
        colId
    );
}
//#endregion

//#region クラス
/**
 * Mineの表示に使用するCSSクラス名を生成する。
 */
class MineClasses {
    /** 基本のCSSクラス名 */
    public static readonly base = formatClass(MINE_PREFIX, 'base');
    /** 爆弾のCSSクラス名 */
    public static readonly bomb = formatClass(MINE_PREFIX, 'bomb');

    /**
     * 近隣の爆弾数に対応するCSSクラス名を生成する。
     *
     * @param neighborCount 近隣の爆弾数
     * @returns CSSクラス名
     */
    public static neighbor(neighborCount: number): string {
        return formatClass(MINE_PREFIX, undefined, 'neighbor', neighborCount);
    }

    /**
     * Mineの状態に対応するCSSクラス名を生成する。
     *
     * @param state Mineの状態
     * @returns CSSクラス名
     */
    public static state(state: MineState): string {
        return formatClass(MINE_PREFIX, undefined, 'state', state);
    }
}
//#endregion

//#endregion

//#region 決定テーブルの型定義
/**
 * Mineの状態に応じたクラスとテキストを決定するための決定テーブル
 */
type MineDecisionTable = {
    /**
     * クラスの決定テーブル
     */
    classes: DecisionTable<MineState, string[], Mine>;
    /**
     * テキストの決定テーブル
     */
    text: DecisionTable<MineState, string, Mine>;
};
//#endregion

//#region 状態遷移テーブル、状態アクションハンドラ (StateMachineContextの実装として使用する)
/**
 * 状態遷移テーブル
 */
type MineTransitionTable = DecisionTableDictionary<MineAction, MineState, Mine>;
/**
 * 状態に応じた述語関数決定テーブル
 */
type MineStateActionHandlers = StateActionHandlers<MineState>;
//#endregion

/**
 * マインスイーパーの1マスを表し、状態と表示を管理する。
 */
export class Mine
    extends UiComponentBase<MineEvent>
    implements StateMachineContext<MineState, MineAction, Mine>
{
    //#region プロパティの内部ストア
    /** 行番号 */
    readonly #rowId;
    /** 列番号 */
    readonly #colId;
    /** 近隣の爆弾数 */
    #neighborBombCount = 0;
    /** 爆弾かどうか */
    #isBomb = false;
    //#endregion

    //#region ステートマシン関連のプロパティ
    /**
     * Mineの状態遷移を管理するStateMachine
     */
    readonly #sateMachine: StateMachine<MineState, MineAction, Mine>;

    /**
     * 状態に応じたクラスとテキストを決定するための決定テーブル
     */
    readonly #decisionTable: MineDecisionTable = {
        classes: {
            closed: (_) => [MineClasses.base, MineClasses.state('closed')],
            mayBe: (_) => [MineClasses.base, MineClasses.state('mayBe')],
            mustBe: (_) => [MineClasses.base, MineClasses.state('mustBe')],
            opened: (mine) => [
                MineClasses.base,
                MineClasses.state('opened'),
                MineClasses.neighbor(mine.#neighborBombCount),
            ],
            touched: (mine) => [
                MineClasses.base,
                MineClasses.state('touched'),
                MineClasses.neighbor(mine.#neighborBombCount),
            ],
            bomb: (_) => [MineClasses.base, MineClasses.state('bomb')],
        },
        text: {
            closed: (_) => ' ',
            mayBe: (_) => '?',
            mustBe: (_) => 'F',
            opened: (mine) =>
                mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
            touched: (mine) =>
                mine.neighborCount === 0 ? ' ' : mine.neighborCount.toString(),
            bomb: (_) => 'B',
        },
    };

    /**
     * 状態遷移テーブル
     * StateMachineContextの実装として使用する
     */
    public readonly transitionTable: MineTransitionTable = {
        touch: {
            closed: (mine: Mine) => (mine.isBomb ? 'closed' : 'touched'),
            mayBe: (_) => 'mayBe',
            mustBe: (_) => 'mustBe',
            opened: (_) => 'opened',
            bomb: (_) => 'bomb',
            touched: (_) => 'touched',
        },
        rClick: {
            closed: (_) => 'mustBe',
            mustBe: (_) => 'mayBe',
            mayBe: (_) => 'closed',
            opened: (_) => 'opened',
            bomb: (_) => 'bomb',
            touched: (_) => 'touched',
        },
        click: {
            closed: (mine: Mine) => (mine.isBomb ? 'bomb' : 'opened'),
            mayBe: (mine: Mine) => (mine.isBomb ? 'bomb' : 'opened'),
            mustBe: (_) => 'mustBe',
            opened: (_) => 'opened',
            bomb: (_) => 'bomb',
            touched: (_) => 'touched',
        },
        reset: {
            closed: (_) => 'closed',
            mayBe: (_) => 'closed',
            mustBe: (_) => 'closed',
            opened: (_) => 'closed',
            bomb: (_) => 'closed',
            touched: (_) => 'closed',
        },
    };
    /**
     * 状態に応じた述語関数決定テーブル
     * StateMachineContextの実装として使用する
     */
    public readonly stateActionHandlers: MineStateActionHandlers = [
        {
            state: undefined,
            action: (mine) => (mine as Mine).#adjustFace(),
        },
        {
            state: undefined,
            action: (mine) => (mine as Mine).emit('state-change', mine),
        },
        {
            // 爆弾通知
            state: 'bomb',
            action: (mine) => (mine as Mine).emit('bombed', mine),
        },
        {
            // 開封通知
            state: ['opened', 'touched', 'mustBe'],
            action: (mine) => (mine as Mine).emit('resolved', mine),
        },
        {
            // 開封通知
            state: ['opened'],
            action: (mine) => (mine as Mine).emit('opened', mine),
        },
    ];
    //#endregion

    /**
     * Mineを生成する。
     *
     * @param rowId 行番号
     * @param colId 列番号
     */
    public constructor(rowId: number, colId: number) {
        // 親クラスのコンストラクタ
        super({
            id: formatMineId(rowId, colId),
            classes: [],
        });
        this.#sateMachine = new StateMachine<MineState, MineAction, Mine>(
            'closed',
            this
        );
        this.#rowId = rowId;
        this.#colId = colId;

        // 表面を調整する
        this.#adjustFace();
    }

    //#region Properties

    /**
     * 行番号を取得する。
     *
     * @returns 行番号
     */
    public get rowId(): number {
        return this.#rowId;
    }

    /**
     * 列番号を取得する。
     *
     * @returns 列番号
     */
    public get colId(): number {
        return this.#colId;
    }

    /**
     * 現在の状態を取得する。
     *
     * @returns Mineの状態
     */
    public get state(): MineState {
        return this.#sateMachine.state;
    }

    /**
     * 爆弾かどうかを取得する。
     *
     * @returns 爆弾の場合は`true`
     */
    public get isBomb(): boolean {
        return this.#isBomb;
    }

    /**
     * 爆弾かどうかを設定する。
     *
     * @param value 爆弾の場合は`true`
     */
    public set isBomb(value: boolean) {
        this.#isBomb = value;
    }

    /**
     * 近隣の爆弾の数を取得する。
     *
     * @returns 近隣の爆弾数
     */
    public get neighborCount(): number {
        return this.#neighborBombCount;
    }

    /**
     * 近隣の爆弾数を設定する。
     *
     * @param value 近隣の爆弾数（0から9まで）
     * @throws 値が0から9の範囲外の場合
     */
    public set neighborCount(value: number) {
        // 数値で範囲に収まっているか
        __assertBetween(value, 0, 9);

        this.#neighborBombCount = value;
    }

    //#endregion

    /**
     * Mineを初期状態に戻す。
     */
    public reset() {
        this.isBomb = false;
        this.neighborCount = 0;
        this.#sateMachine.applyAction('reset');
    }

    /**
     * Mineにタッチしたときの状態遷移を適用する。
     * ここで、タッチとは、Openしたときの周辺Mineの挙動を表す。
     */
    public touch() {
        this.#sateMachine.applyAction('touch');
    }

    //#region イベントハンドラ
    /**
     * 左クリックのイベントハンドラ
     * UiComponentBaseの抽象メソッドの実装
     */
    protected override onLeftClick() {
        this.#sateMachine.applyAction('click');
    }
    /**
     * 右クリックのイベントハンドラ
     * UiComponentBaseの抽象メソッドの実装
     */
    protected override onRightClick() {
        this.#sateMachine.applyAction('rClick');
    }
    //#endregion

    //#region private methods
    /**
     * テキストとスタイルの調整
     */
    #adjustFace() {
        // テキストを設定
        this.text = this.#decisionTable.text[this.#sateMachine.state](this);
        // クラスを設定
        this.classes =
            this.#decisionTable.classes[this.#sateMachine.state](this);
    }
    //#endregion
}
