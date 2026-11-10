import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MineRow } from '../../../../src/components/mine-row.js';
import { Mine } from '../../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../../util/document_mock.js';

void describe('MineRow: constructor', () => {
    beforeEach(() => {
        mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void it('stores the row ID and size', () => {
        const mineRow = new MineRow({
            rowId: 2,
            size: 3,
            mineGenerator: (rowId, colId) => new Mine(rowId, colId),
        });

        assert.equal(mineRow.rowId, 2);
        assert.equal(mineRow.size, 3);
    });

    void it('generates one mine for each column in order', () => {
        const generatedCoordinates: [number, number][] = [];
        const mineRow = new MineRow({
            rowId: 2,
            size: 3,
            mineGenerator: (rowId, colId) => {
                generatedCoordinates.push([rowId, colId]);
                return new Mine(rowId, colId);
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

    void it('sets the base class and a row-specific ID', () => {
        const mineRow = new MineRow({
            rowId: 2,
            size: 3,
            mineGenerator: (rowId, colId) => new Mine(rowId, colId),
        });

        assert.deepEqual(mineRow.classes, ['___mine_row_base']);
        assert.match(mineRow.id, /^___mine_row-2-[A-Za-z0-9]{8}$/);
        assert.equal(mineRow.element.tagName.toLowerCase(), 'div');
    });

    void it('accepts the maximum size and last valid row ID', () => {
        const mineRow = new MineRow({
            rowId: 19,
            size: 20,
            mineGenerator: (rowId, colId) => new Mine(rowId, colId),
        });

        assert.equal(mineRow.rowId, 19);
        assert.equal(mineRow.size, 20);
        assert.equal(mineRow.children.length, 20);
    });

    void it('rejects sizes outside the supported range', () => {
        for (const size of [-1, 21]) {
            assert.throws(() => {
                new MineRow({
                    rowId: 0,
                    size,
                    mineGenerator: (rowId, colId) => new Mine(rowId, colId),
                });
            });
        }

        assert.throws(() => {
            new MineRow({
                rowId: 0,
                size: 0,
                mineGenerator: (rowId, colId) => new Mine(rowId, colId),
            });
        });
    });

    void it('rejects row IDs outside the range for the configured size', () => {
        for (const rowId of [-1, 3]) {
            assert.throws(() => {
                new MineRow({
                    rowId,
                    size: 3,
                    mineGenerator: (generatedRowId, colId) =>
                        new Mine(generatedRowId, colId),
                });
            });
        }
    });
});
