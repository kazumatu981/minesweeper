import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MineField } from '../../../../src/components/mine-field.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../../util/document_mock.js';

void describe('MineField', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('constructor', () => {
        void it('creates rows and mines from the configured size', () => {
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

        void it('rejects invalid board and bomb configuration', () => {
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

    void describe('events and score', () => {
        void it('emits failed and updates the score when a bomb is opened', () => {
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

        void it('opens neighboring empty mines and emits ended when all are resolved', () => {
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

        void it('emits ended when every mine is flagged', () => {
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
    });

    void it('resets with new size and bomb positions', () => {
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
