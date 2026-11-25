import {
    type StateMachineContext,
    type StateActionHandlers,
    type DecisionTableDictionary,
    StateMachine,
    UiComponentWithChildrenBase,
    formatClass,
    formatIdWithRandomSuffix,
    __assertBetween,
    __assertIsUndefined,
    __assertIsDefined,
} from '../common/index.js';
import {
    type MinesOption,
    type MinePosition,
    safeGetBomPositions,
} from './mine-position.js';
import { MineRow } from './mine-row.js';
import { Mine, type MineEvent } from './mine.js';

//#region 状態、イベント、アクションの定義
/**
 * MineFieldの状態定義
 */
export type MineFieldState = 'initialized' | 'started' | 'ended' | 'failed';
/**
 * MineFieldのイベント定義
 */
export type MineFieldEvent = MineEvent | 'ended' | 'failed' | 'score-changed';
/**
 * MineFieldアクション定義
 */
type MineFieldAction =
    /** 解答に近づいた */
    | 'resolve'
    /** 失敗した */
    | 'fail'
    /** リセットした */
    | 'reset';
/**
 * サイズの最大値
 */
const SIZE_MAX = 20;
//#endregion

//#region 識別子, クラス
const MINE_FIELD_PREFIX = '___mine_field';
/**
 * 固有な識別子を作成する
 * @returns 識別子
 */
function formatMineFieldId(): string {
    return formatIdWithRandomSuffix(MINE_FIELD_PREFIX);
}
/**
 * MineFieldCSSクラス名
 */
const MINE_FIELD_BASE_CLASS = formatClass(MINE_FIELD_PREFIX, 'base');
//#endregion

//#region MineFieldの設定

/**
 * MineFieldオプション
 */
export interface MineFieldOptions extends MinesOption {
    size: number;
}

function __assertMineFieldOptions(mineFieldOptions: MineFieldOptions) {
    __assertBetween(mineFieldOptions.size, 0, SIZE_MAX);
    if (mineFieldOptions.bombs !== undefined) {
        __assertIsUndefined(mineFieldOptions.bombCount);
        mineFieldOptions.bombs.forEach((bombPosition) => {
            __assertBetween(bombPosition.rowId, 0, mineFieldOptions.size);
            __assertBetween(bombPosition.colId, 0, mineFieldOptions.size);
        });
        __assertBetween(
            mineFieldOptions.bombs.length,
            0,
            mineFieldOptions.size * mineFieldOptions.size
        );
    } else {
        __assertIsDefined(mineFieldOptions.bombCount);
        __assertBetween(
            mineFieldOptions.bombCount!,
            0,
            mineFieldOptions.size * mineFieldOptions.size
        );
    }
}
//#endregion

//#region 状態遷移テーブル、状態アクションハンドラ (StateMachineContextの実装として使用する)
/**
 * 状態遷移テーブル
 */
type StateMachineTransitionTable = DecisionTableDictionary<
    MineFieldAction,
    MineFieldState,
    MineField
>;
/**
 * 状態に応じた述語関数決定テーブル
 */
type MineFieldStateActionHandlers = StateActionHandlers<MineFieldState>;
//#endregion

//#region イベントマップ
const eventMap = new Map<MineEvent, MineFieldEvent>([
    ['bombed', 'bombed'],
    ['resolved', 'resolved'],
    ['opened', 'opened'],
    ['state-change', 'state-change'],
]);
//#endregion

//#region スコア定義
export interface MineScore {
    /** 盤面のマス数 */
    total: number;
    /** 爆弾だと確定しているマス数 */
    flagged: number;
    /** 開封済み、または周辺の開封によりタッチされたマス数 */
    estimated: number;
    /** 未確定のマス数 */
    remained: number;
}
//#endregion

/**
 * マインスイーパーの盤面全体と、盤面の状態・スコアを管理する。
 */
export class MineField
    extends UiComponentWithChildrenBase<MineFieldEvent, MineEvent, MineRow>
    implements StateMachineContext<MineFieldState, MineFieldAction, MineField>
{
    //#region プロパティの内部ストア
    /** 盤面のサイズと爆弾配置の設定 */
    #options: { current: MineFieldOptions };
    //#endregion

    //#region ステートマシン関連のプロパティ
    /** 盤面の状態遷移を管理するStateMachine */
    readonly #stateMachine: StateMachine<
        MineFieldState,
        MineFieldAction,
        MineField
    >;

    /**
     * 盤面の状態遷移テーブル。
     * StateMachineContextの実装として使用する。
     */
    public readonly transitionTable: StateMachineTransitionTable = {
        resolve: {
            initialized: (field) => (field.isEnded ? 'ended' : 'started'),
            started: (field) => (field.isEnded ? 'ended' : 'started'),
            ended: (_) => 'ended',
            failed: (_) => 'failed',
        },
        fail: {
            initialized: (_) => 'failed',
            started: (_) => 'failed',
            ended: (_) => 'ended',
            failed: (_) => 'failed',
        },
        reset: {
            initialized: (_) => 'initialized',
            started: (_) => 'initialized',
            ended: (_) => 'initialized',
            failed: (_) => 'initialized',
        },
    };

    /**
     * 状態に応じてイベントを発行するハンドラ。
     * StateMachineContextの実装として使用する。
     */
    public readonly stateActionHandlers: MineFieldStateActionHandlers = [
        {
            state: 'ended',
            action: (field) => (field as MineField).emit('ended', field),
        },
        {
            state: 'failed',
            action: (field) => (field as MineField).emit('failed', field),
        },
        {
            state: 'initialized',
            action: (field) => ((field as MineField).enabled = true),
        },
        {
            state: ['failed', 'ended'],
            action: (field) => ((field as MineField).enabled = false),
        },
    ];
    //#endregion

    //#region コンストラクタ
    /**
     * MineFieldを生成する。
     *
     * @param options 盤面サイズと爆弾配置の設定
     * @throws 盤面サイズまたは爆弾配置が有効な範囲外の場合
     */
    public constructor(options: MineFieldOptions) {
        __assertMineFieldOptions(options);
        const optionsReference = { current: options };

        super({
            id: formatMineFieldId(),
            classes: [MINE_FIELD_BASE_CLASS],
            childrenCount: options.size,
            generateChild: (rowId) =>
                new MineRow({
                    rowId,
                    size: optionsReference.current.size,
                    mineGenerator: (rowId, colId) =>
                        new Mine(
                            { rowId, colId },
                            optionsReference.current.size
                        ),
                }),
            eventMap,
        });

        this.#stateMachine = new StateMachine<
            MineFieldState,
            MineFieldAction,
            MineField
        >('initialized', this);

        this.#options = optionsReference;

        this.#registerEvents();

        this.reset();
    }
    //#endregion

    //#region プロパティ
    /**
     * 盤面の1辺のマス数を取得する。
     *
     * @returns 盤面の1辺のマス数
     */
    public get size(): number {
        return this.#options.current.size;
    }

    /**
     * 盤面を構成する行を取得する。
     *
     * @returns 盤面の行
     */
    public get rows(): readonly MineRow[] {
        return this.children;
    }

    /**
     * 盤面上のすべてのマスを取得する。
     *
     * @returns 盤面上のMine
     */
    public get mines(): Mine[] {
        return this.children.flatMap((row) => row.children);
    }

    /**
     * 現在の盤面スコアを取得する。
     *
     * @returns マス数、確定数、推定数、未確定数
     */
    public get score(): MineScore {
        return {
            total: this.totalCount,
            flagged: this.flagged.length,
            estimated: this.estimated.length,
            remained:
                this.totalCount - this.flagged.length - this.estimated.length,
        };
    }

    /** すべてのマスが確定または開封されたかを返す。 */
    private get isEnded(): boolean {
        const score = this.score;
        return score.estimated + score.flagged === score.total;
    }

    /** 盤面の総マス数を取得する。 */
    private get totalCount(): number {
        return this.size * this.size;
    }

    /** 爆弾だと確定しているマスを取得する。 */
    private get flagged(): Mine[] {
        return this.mines.filter((mine) => mine.state === 'mustBe');
    }

    /** 開封済み、または周辺の開封によりタッチされたマスを取得する。 */
    private get estimated(): Mine[] {
        return this.mines.filter(
            (mine) => mine.state === 'opened' || mine.state === 'touched'
        );
    }
    //#endregion

    //#region 公開メソッド
    /**
     * 指定した位置のMineを取得する。
     *
     * @param position 取得するマスの位置
     * @returns 指定位置のMine
     */
    public mine(position: MinePosition): Mine {
        return this.children[position.rowId]!.children[position.colId]!;
    }

    /**
     * 盤面を初期状態に戻す。
     *
     * @param options 指定した場合に適用する新しい盤面設定
     */
    public reset(options?: MineFieldOptions): void {
        if (options) {
            this.#options.current = options;
            this.resetChildren(this.#options.current.size);
        }
        this.#initialize();
        // 状態を遷移させる
        this.#stateMachine.applyAction('reset');
    }
    //#endregion

    //#region イベントハンドラ
    /**
     * 爆弾を開けたときの失敗処理を行う。
     *
     * @param _mine 爆弾を開けたMine
     */
    protected fail(_mine: Mine): void {
        this.#stateMachine.applyAction('fail');
        this.emit('score-changed', this);
    }

    /**
     * マスの解決に応じて状態とスコアを更新する。
     *
     * @param _mine 解決されたMine
     */
    protected resolve(_mine: Mine): void {
        this.#stateMachine.applyAction('resolve');
        this.emit('score-changed', this);
    }

    /**
     * 開封したマスの周辺にあるマスをタッチする。
     *
     * @param mine 開封したMine
     */
    protected touch(mine: Mine): void {
        mine.neighborPositions
            .map((position) => this.mine(position))
            .filter((neighborMine) => neighborMine !== mine)
            .forEach((neighborMine) => {
                neighborMine.touch();
            });
    }

    /** 右クリック処理。盤面自体では何も行わない。 */
    protected override onRightClick(): void {}

    /** 左クリック処理。盤面自体では何も行わない。 */
    protected override onLeftClick(): void {}
    //#endregion

    //#region private methods
    /** すべてのマスを初期化し、爆弾と近隣の爆弾数を設定する。 */
    #initialize(): void {
        // 盤面をリセットする
        this.mines.forEach((mine) => {
            mine.reset();
        });

        // Bombを設定する
        safeGetBomPositions(this.#options.current).forEach((position) => {
            this.mine(position).isBomb = true;
        });

        // 近隣のBombの個数を調整する
        this.mines.forEach((mine) => {
            mine.neighborCount = mine.neighborPositions
                .map((position) => this.mine(position))
                .filter((mine) => mine.isBomb).length;
        });
    }

    /** Mineからのイベントを盤面の処理に接続する。 */
    #registerEvents() {
        this.on('resolved', (mine) => this.resolve(mine as Mine));
        this.on('bombed', (mine) => this.fail(mine as Mine));
        this.on('opened', (mine) => this.touch(mine as Mine));
    }
    //#endregion
}
