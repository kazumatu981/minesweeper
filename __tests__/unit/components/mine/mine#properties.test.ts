import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../../util/document_mock.js';

void describe('Mine のプロパティ', () => {
    let _mockDoc;

    beforeEach(() => {
        _mockDoc = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('isBomb', () => {
        void it('初期値は false である', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            assert.equal(mine.isBomb, false);
        });
        void it('true を設定すると true を取得できる', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            mine.isBomb = true;

            assert.equal(mine.isBomb, true);
        });
        void it('true を設定した後も true を取得できる', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);

            mine.isBomb = true;

            assert.equal(mine.isBomb, true);
        });
    });

    void describe('neighborCount', () => {
        Array.from({ length: 9 })
            .map((_, i) => i)
            .forEach((count) => {
                void it(`隣接マス数 ${count} を設定すると同じ値を取得できる`, () => {
                    const mine = new Mine({ rowId: 1, colId: 1 }, 3);

                    mine.neighborCount = count;

                    assert.equal(mine.neighborCount, count);
                });
            });
        void it('許容範囲外の値を拒否する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 }, 3);
            assert.throws(() => {
                mine.neighborCount = 10;
            });
        });
    });

    void describe('neighborPositions', () => {
        void it('自身を含む周囲の全座標を返す', () => {
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

        void it('角のマスでは盤面内の座標だけを返す', () => {
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
