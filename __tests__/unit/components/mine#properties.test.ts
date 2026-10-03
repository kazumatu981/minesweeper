import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

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
            const mine = new Mine(1, 1);

            assert.equal(mine.isBomb, false);
        });
        void it('get/set: true', () => {
            const mine = new Mine(1, 1);

            mine.setBomb();

            assert.equal(mine.isBomb, true);
        });
    });

    void describe('Property: isTouched:', () => {
        void it('default is false', () => {
            const mine = new Mine(1, 1);

            assert.equal(mine.isTouched, false);
        });
        void it('get/set: true', () => {
            const mine = new Mine(1, 1);

            mine.touch();

            assert.equal(mine.isTouched, true);
        });
    });

    void describe('property: neighborCount', () => {
        Array.from({ length: 9 })
            .map((_, i) => i)
            .forEach((count) => {
                void it(`get/set: ${count}`, () => {
                    const mine = new Mine(1, 1);

                    mine.setNeighborCount(count);

                    assert.equal(mine.neighborCount, count);
                });
            });
        void it('must be in range', () => {
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.setNeighborCount(10);
            });
        });
    });
});
