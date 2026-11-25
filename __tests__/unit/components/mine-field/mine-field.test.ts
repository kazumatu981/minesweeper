import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MineField } from '../../../../src/components/mine-field.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../../util/document_mock.js';

function assertMineFieldEnabled(mineField: MineField, expected: boolean): void {
    assert.equal(mineField.enabled, expected);
    assert.ok(mineField.rows.every((row) => row.enabled === expected));
    assert.ok(mineField.mines.every((mine) => mine.enabled === expected));
}

void describe('MineField の振る舞い', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('コンストラクター', () => {
        void it('指定したサイズに応じた行とマスを生成する', () => {
            const mineField = new MineField({
                size: 2,
                bombs: [{ rowId: 0, colId: 0 }],
            });

            assert.equal(mineField.size, 2);
            assert.equal(mineField.rows.length, 2);
            assert.equal(mineField.mines.length, 4);
            assert.deepEqual(
                mineField.mines.map((mine) => [mine.rowId, mine.colId]),
                [
                    [0, 0],
                    [0, 1],
                    [1, 0],
                    [1, 1],
                ]
            );
            assert.equal(mineField.mine({ rowId: 0, colId: 0 }).isBomb, true);
            assert.equal(mineField.mine({ rowId: 1, colId: 1 }).neighborCount, 1);
            assert.deepEqual(mineField.score, {
                total: 4,
                flagged: 0,
                estimated: 0,
                remained: 4,
            });
        });

        void it('不正な盤面サイズや地雷の設定を拒否する', () => {
            for (const size of [-1, 21]) {
                assert.throws(() => {
                    new MineField({ size, bombs: [] });
                });
            }

            assert.throws(() => {
                new MineField({ size: 2 });
            });
            assert.throws(() => {
                new MineField({ size: 2, bombCount: 5 });
            });
            assert.throws(() => {
                new MineField({
                    size: 2,
                    bombs: [{ rowId: -1, colId: 0 }],
                });
            });
            assert.throws(() => {
                new MineField({
                    size: 2,
                    bombs: [],
                    bombCount: 0,
                });
            });
        });
    });

    void describe('getNeighborMines', () => {
        void it('自身を含む周囲の全マスを返す', () => {
            const mineField = new MineField({ size: 3, bombs: [] });

            assert.deepEqual(
                mineField
                    .getNeighborMines({ rowId: 1, colId: 1 })
                    .map((mine) => mine.position),
                [
                    { rowId: 0, colId: 0 },
                    { rowId: 1, colId: 0 },
                    { rowId: 2, colId: 0 },
                    { rowId: 0, colId: 1 },
                    { rowId: 1, colId: 1 },
                    { rowId: 2, colId: 1 },
                    { rowId: 0, colId: 2 },
                    { rowId: 1, colId: 2 },
                    { rowId: 2, colId: 2 },
                ]
            );
        });

        void it('角のマスでは盤面内のマスだけを返す', () => {
            const mineField = new MineField({ size: 3, bombs: [] });

            assert.deepEqual(
                mineField
                    .getNeighborMines({ rowId: 0, colId: 0 })
                    .map((mine) => mine.position),
                [
                    { rowId: 0, colId: 0 },
                    { rowId: 1, colId: 0 },
                    { rowId: 0, colId: 1 },
                    { rowId: 1, colId: 1 },
                ]
            );
        });
    });

    void describe('イベントとスコア', () => {
        void it('地雷を開くと failed を通知し、スコアを更新する', () => {
            const mineField = new MineField({
                size: 2,
                bombs: [{ rowId: 0, colId: 0 }],
            });
            let failedCount = 0;
            let scoreChangedCount = 0;
            mineField.on('failed', () => {
                failedCount += 1;
            });
            mineField.on('score-changed', () => {
                scoreChangedCount += 1;
            });

            mocker.dispatchMouseEvent(
                mineField.mine({ rowId: 0, colId: 0 }).element,
                'click'
            );

            assert.equal(mineField.mine({ rowId: 0, colId: 0 }).state, 'bomb');
            assert.equal(failedCount, 1);
            assert.equal(scoreChangedCount, 1);
            assert.deepEqual(mineField.score, {
                total: 4,
                flagged: 0,
                estimated: 0,
                remained: 4,
            });
        });

        void it('失敗後は盤面を無効化し、リセットすると再有効化する', () => {
            const mineField = new MineField({
                size: 2,
                bombs: [{ rowId: 0, colId: 0 }],
            });

            mocker.dispatchMouseEvent(
                mineField.mine({ rowId: 0, colId: 0 }).element,
                'click'
            );

            assertMineFieldEnabled(mineField, false);

            const unopenedMine = mineField.mine({ rowId: 1, colId: 1 });
            mocker.dispatchMouseEvent(unopenedMine.element, 'click');

            assert.equal(unopenedMine.state, 'closed');

            mineField.reset();

            assertMineFieldEnabled(mineField, true);
        });

        void it('空のマスを開くと周囲も開き、すべて解決すると ended を通知する', () => {
            const mineField = new MineField({ size: 2, bombs: [] });
            let endedCount = 0;
            mineField.on('ended', () => {
                endedCount += 1;
            });

            mocker.dispatchMouseEvent(
                mineField.mine({ rowId: 0, colId: 0 }).element,
                'click'
            );

            assert.equal(endedCount, 1);
            assert.deepEqual(mineField.score, {
                total: 4,
                flagged: 0,
                estimated: 4,
                remained: 0,
            });
            assert.ok(
                mineField.mines.every(
                    (mine) => mine.state === 'opened' || mine.state === 'touched'
                )
            );
        });

        void it('すべてのマスに旗を立てると ended を通知する', () => {
            const mineField = new MineField({ size: 2, bombs: [] });
            let endedCount = 0;
            mineField.on('ended', () => {
                endedCount += 1;
            });

            mineField.mines.forEach((mine) => {
                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            });

            assert.equal(endedCount, 1);
            assert.deepEqual(mineField.score, {
                total: 4,
                flagged: 4,
                estimated: 0,
                remained: 0,
            });
        });

        void it('すべて解決すると盤面と子コンポーネントを無効化する', () => {
            const mineField = new MineField({ size: 2, bombs: [] });

            mocker.dispatchMouseEvent(
                mineField.mine({ rowId: 0, colId: 0 }).element,
                'click'
            );

            assertMineFieldEnabled(mineField, false);
        });
    });

    void it('新しいサイズと地雷の位置で盤面をリセットする', () => {
        const mineField = new MineField({
            size: 2,
            bombs: [{ rowId: 0, colId: 0 }],
        });
        const options = {
            size: 3,
            bombs: [{ rowId: 2, colId: 2 }],
        };

        mineField.reset(options);

        assert.equal(mineField.size, 3);
        assert.equal(mineField.rows.length, 3);
        assert.equal(mineField.mines.length, 9);
        assert.equal(mineField.mine({ rowId: 0, colId: 0 }).isBomb, false);
        assert.equal(mineField.mine({ rowId: 2, colId: 2 }).isBomb, true);
        assert.deepEqual(mineField.score, {
            total: 9,
            flagged: 0,
            estimated: 0,
            remained: 9,
        });
    });
});
