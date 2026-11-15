import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../../util/document_mock.js';

void describe('Mine', () => {
    let _mockDoc;

    beforeEach(() => {
        _mockDoc = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('Property: isBomb:', () => {
        void it('default is false', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            assert.equal(mine.isBomb, false);
        });
        void it('get/set: true', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            mine.isBomb = true;

            assert.equal(mine.isBomb, true);
        });
        void it('get/set: false', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            mine.isBomb = true;

            assert.equal(mine.isBomb, true);
        });
    });

    void describe('property: neighborCount', () => {
        Array.from({ length: 9 })
            .map((_, i) => i)
            .forEach((count) => {
                void it(`get/set: ${count}`, () => {
                    const mine = new Mine({ rowId: 1, colId: 1 }, 3);

                    mine.neighborCount = count;

                    assert.equal(mine.neighborCount, count);
                });
            });
        void it('must be in range', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);
            assert.throws(() => {
                mine.neighborCount = 10;
            });
        });
    });

    void describe('property: neighborPositions', () => {
        void it('returns all positions around a mine, including itself', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            assert.deepEqual(mine.neighborPositions, [
                { rowId: 0, colId: 0 },
                { rowId: 1, colId: 0 },
                { rowId: 2, colId: 0 },
                { rowId: 0, colId: 1 },
                { rowId: 1, colId: 1 },
                { rowId: 2, colId: 1 },
                { rowId: 0, colId: 2 },
                { rowId: 1, colId: 2 },
                { rowId: 2, colId: 2 },
            ]);
        });

        void it('returns only in-range positions at a corner', () => {
            const mine = new Mine({ rowId: 0, colId: 0 }, 3);

            assert.deepEqual(mine.neighborPositions, [
                { rowId: 0, colId: 0 },
                { rowId: 1, colId: 0 },
                { rowId: 0, colId: 1 },
                { rowId: 1, colId: 1 },
            ]);
        });
    });
});
