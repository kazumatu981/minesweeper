import {
    StateMachine,
    type StateAction,
    type DecisionTableDictionary,
    getNeighbor,
    createRandomCoordinates,
} from '../common/index.js';
import {
    type MineFieldEvent,
    type MineFieldState,
    MINE_FIELD_BASE_CLASS,
    formatMineFieldId,
} from './utils/index.js';
import { MineRow } from './mine-row.js';
import { type Mine } from './mine.js';

type MineFieldAction = 'open-mine' | 'fail' | 'reset';

export interface MineFieldOptions {
    size: number;
    bombCount: number;
}

export class MineField extends StateMachine<
    MineFieldEvent,
    MineFieldState,
    MineFieldAction
> {
    #options: MineFieldOptions;
    #rows: MineRow[] | undefined;
    readonly #element: HTMLDivElement;

    readonly transitionTable: DecisionTableDictionary<
        MineFieldAction,
        MineFieldState,
        this
    > = {
        'open-mine': {
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
            failed: (_) => 'failed',
        },
    };

    readonly stateActions: StateAction<this, MineFieldState>[] = [
        {
            state: 'ended',
            action: (field) => field.emit('resolved'),
        },
        {
            state: 'failed',
            action: (field) => field.emit('bombed'),
        },
    ];

    get isEnded(): boolean {
        return this.estimated + this.bombCount === this.size * this.size;
    }
    constructor(options: MineFieldOptions) {
        super('initialized');

        this.#options = options;
        this.#element = this.element;

        this.resetField(options.size, options.bombCount);
    }

    get size(): number {
        return this.#options.size;
    }
    get bombCount(): number {
        return this.#options.bombCount;
    }

    get rows(): MineRow[] {
        return this.#rows!;
    }

    get mines(): Mine[] {
        return this.rows.flatMap((row) => row.mines);
    }
    get element(): HTMLDivElement {
        if (!this.#element) {
            const fieldElement = document.createElement('div');
            fieldElement.id = formatMineFieldId();
            fieldElement.classList.add(MINE_FIELD_BASE_CLASS);
            return fieldElement;
        } else {
            return this.#element;
        }
    }

    get estimated(): number {
        return this.mines.filter(
            (mine) => mine.state === 'opened' || mine.state === 'touched'
        ).length;
    }
    mine(rowId: number, colId: number): Mine {
        return this.rows[rowId]!.mines[colId]!;
    }

    resetField(size: number, mineCount: number) {
        // 行をセットする
        this.#resetRows(size);

        // 爆弾をセットする
        this.#setMines(mineCount);
        this.goNextState('reset');
    }

    fail(_mine: Mine): void {
        this.goNextState('fail');
    }
    openMine(mine: Mine): void {
        this.#getNeighborMines(mine).forEach((m) => {
            if (m !== mine) {
                m.touch();
            }
        });
        this.goNextState('open-mine');
    }

    #getNeighborMines(mine: Mine): Mine[] {
        return getNeighbor({ x: mine.rowId, y: mine.colId }, this.size).map(
            (coordinate) => this.mine(coordinate.x, coordinate.y)
        );
    }
    #resetRows(size: number): void {
        // 行を作成する
        if (this.size !== size || this.#rows === undefined) {
            const rows: MineRow[] = Array.from({
                length: this.#options.size,
            }).map((_, rowId) => new MineRow(rowId, this.#options.size));

            this.element.replaceChildren();
            rows.forEach((row) => {
                this.element.appendChild(row.element);
            });
            this.#rows = rows;
            this.mines.forEach((mine) => {
                mine.on('bombed', (m) => this.fail(m));
                mine.on('opened', (m) => this.openMine(m));
            });
        }

        this.mines.forEach((mine) => {
            mine.isBomb = false;
            mine.neighborCount = 0;
        });
    }

    #setMines(mineCount: number) {
        createRandomCoordinates(this.size, mineCount).forEach((v) => {
            this.mine(v.x, v.y).isBomb = true;
        });

        this.mines.forEach((mine) => {
            const neighborBombCount = this.#getNeighborMines(mine).filter(
                (m) => m.isBomb
            ).length;
            mine.neighborCount = neighborBombCount;
        });
    }
}
