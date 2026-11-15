import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MineRow } from '../../../../src/components/mine-row.js';
import { Mine } from '../../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../../util/document_mock.js';

void describe('MineRow のコンストラクター', () => {
    beforeEach(() => {
        mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void it('行 ID とサイズを保持する', () => {
        const mineRow = new MineRow({
            rowId: 2,
            size: 3,
            mineGenerator: (rowId, colId) =>
                new Mine({ rowId, colId }, 3),
        });

        assert.equal(mineRow.rowId, 2);
        assert.equal(mineRow.size, 3);
    });

    void it('各列に対応するマスを順番に生成する', () => {
        const generatedCoordinates: [number, number][] = [];
        const mineRow = new MineRow({
            rowId: 2,
            size: 3,
            mineGenerator: (rowId, colId) => {
                generatedCoordinates.push([rowId, colId]);
                return new Mine({ rowId, colId }, 3);
            },
        });

        assert.deepEqual(generatedCoordinates, [
            [2, 0],
            [2, 1],
            [2, 2],
        ]);
        assert.deepEqual(
            mineRow.children.map(({ rowId, colId }) => [rowId, colId]),
            [
                [2, 0],
                [2, 1],
                [2, 2],
            ]
        );
        assert.deepEqual(
            Array.from(mineRow.element.children),
            mineRow.children.map((mine) => mine.element)
        );
    });

    void it('基底クラスと行固有の ID を設定する', () => {
        const mineRow = new MineRow({
            rowId: 2,
            size: 3,
            mineGenerator: (rowId, colId) =>
                new Mine({ rowId, colId }, 3),
        });

        assert.deepEqual(mineRow.classes, ['___mine_row_base']);
        assert.match(mineRow.id, /^___mine_row-2-[A-Za-z0-9]{8}$/);
        assert.equal(mineRow.element.tagName.toLowerCase(), 'div');
    });

    void it('最大サイズと、そのサイズで有効な最後の行 ID を受け入れる', () => {
        const mineRow = new MineRow({
            rowId: 19,
            size: 20,
            mineGenerator: (rowId, colId) =>
                new Mine({ rowId, colId }, 20),
        });

        assert.equal(mineRow.rowId, 19);
        assert.equal(mineRow.size, 20);
        assert.equal(mineRow.children.length, 20);
    });

    void it('サポート範囲外のサイズを拒否する', () => {
        for (const size of [-1, 21]) {
            assert.throws(() => {
                new MineRow({
                    rowId: 0,
                    size,
                    mineGenerator: (rowId, colId) =>
                        new Mine({ rowId, colId }, size),
                });
            });
        }

        assert.throws(() => {
            new MineRow({
                rowId: 0,
                size: 0,
                mineGenerator: (rowId, colId) =>
                    new Mine({ rowId, colId }, 0),
            });
        });
    });

    void it('設定サイズの範囲外の行 ID を拒否する', () => {
        for (const rowId of [-1, 3]) {
            assert.throws(() => {
                new MineRow({
                    rowId,
                    size: 3,
                    mineGenerator: (generatedRowId, colId) =>
                        new Mine({ rowId: generatedRowId, colId }, 3),
                });
            });
        }
    });
});
