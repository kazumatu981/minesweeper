/* eslint-disable max-lines-per-function */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine, MINE_STATE_CLOSED } from '../../../parts/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

/**
 * コンストラクタのテスト
 */
describe('Mine: constructor', () => {
    beforeEach(() => {
        mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    /**
     * 各プロパティの初期値確認
     */
    describe('initial values', () => {
        it('state: closed', () => {
            const mine = new Mine(1, 2);

            assert.equal(mine.state, MINE_STATE_CLOSED);
        });
        it('isBomb: false', () => {
            const mine = new Mine(1, 2);

            assert.equal(mine.isBomb, false);
        });
        it('neighborCount: 0', () => {
            const mine = new Mine(1, 2);
            assert.equal(mine.neighborCount, 0);
        });
        it('element: not undefined', () => {
            const mine = new Mine(1, 2);
            assert.notEqual(mine.element, undefined);
        });
        it('id: ___mine-<rowId>-<colId>', () => {
            const expectedId = '___mine-1-2';

            const mine = new Mine(1, 2);
            assert.equal(mine.id, expectedId);
        });
    });

    /**
     * DOMエレメントの状態
     */
    describe('DOM element', () => {
        it('should be create DIV element', () => {
            const mine = new Mine(1, 2);

            assert.equal(mine.element.tagName.toLowerCase(), 'div');
        });
        it('elements id must be expected', () => {
            const expectedId = '___mine-1-2';
            const mine = new Mine(1, 2);
            assert.equal(mine.element.id, expectedId);
        });
    });

    it('exceptions: if rowId is not number.', () => {
        assert.throws(() => {
            new Mine('someRowId', 2);
        });
    });
    it('exceptions: if colId is not number. ', () => {
        assert.throws(() => {
            new Mine(1, 'someColId');
        });
    });
});
