/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine, MINE_STATES } from '../../../parts/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

describe('Mine', () => {
    let _mockDoc;

    beforeEach(() => {
        _mockDoc = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    describe('Property: isBomb:', () => {
        it('get/set: true', () => {
            const mine = new Mine(1, 1);

            mine.isBomb = true;

            assert.equal(mine.isBomb, true);
        });
        it('get/set: false', () => {
            const mine = new Mine(1, 1);

            mine.isBomb = false;

            assert.equal(mine.isBomb, false);
        });
        it('must be boolean', () => {
            // 文字列を指定すると例外が発生する
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.isBomb = 'someString';
            });
        });
    });

    describe('Property: isTouched:', () => {
        it('get/set: true', () => {
            const mine = new Mine(1, 1);

            mine.isTouched = true;

            assert.equal(mine.isTouched, true);
        });
        it('get/set: false', () => {
            const mine = new Mine(1, 1);

            mine.isTouched = false;

            assert.equal(mine.isTouched, false);
        });
        it('must be boolean', () => {
            // 文字列を指定すると例外が発生する
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.isTouched = 'someString';
            });
        });
    });

    describe('Property: state:', () => {
        Object.keys(MINE_STATES).forEach((state) => {
            it(`get/set: '${state}'`, () => {
                const mine = new Mine(1, 1);

                mine.state = state;

                assert.equal(mine.state, state);
            });
        });
        it('must be string', () => {
            // 数値を指定すると例外が発生する
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.state = 5;
            });
        });

        it('must be reserved string', () => {
            // 予約文字列以外を指定すると例外が発生する
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.state = 'someString';
            });
        });
    });

    describe('property: neighborCount', () => {
        Array.from({ length: 9 })
            .map((_, i) => i)
            .forEach((count) => {
                it(`get/set: ${count}`, () => {
                    const mine = new Mine(1, 1);

                    mine.neighborCount = count;

                    assert.equal(mine.neighborCount, count);
                });
            });
        it('must be number', () => {
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.neighborCount = 'abc def';
            });
        });
        it('must be in range', () => {
            const mine = new Mine(1, 1);
            assert.throws(() => {
                mine.neighborCount = 9;
            });
        });
    });
});
