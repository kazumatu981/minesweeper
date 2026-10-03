import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MINE_STATES } from '../../../src/components/constants/index.js';
import { Mine } from '../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

/**
 * コンストラクタのテスト
 */
void describe('Mine: constructor', () => {
    beforeEach(() => {
        mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    /**
     * 各プロパティの初期値確認
     */
    void describe('initial values', () => {
        void it('state: closed', () => {
            const mine = new Mine(1, 2);

            assert.equal(mine.state, MINE_STATES.closed);
        });
        void it('isBomb: false', () => {
            const mine = new Mine(1, 2);

            assert.equal(mine.isBomb, false);
        });
        void it('neighborCount: 0', () => {
            const mine = new Mine(1, 2);
            assert.equal(mine.neighborCount, 0);
        });
        void it('element: not undefined', () => {
            const mine = new Mine(1, 2);
            assert.notEqual(mine.element, undefined);
        });
        void it('id: ___mine-<rowId>-<colId>', () => {
            const expectedId = '___mine-1-2';

            const mine = new Mine(1, 2);
            assert.equal(mine.id, expectedId);
        });
    });

    /**
     * DOMエレメントの状態
     */
    void describe('DOM element', () => {
        void it('should be create DIV element', () => {
            const mine = new Mine(1, 2);

            assert.equal(mine.element.tagName.toLowerCase(), 'div');
        });
        void it('elements id must be expected', () => {
            const expectedId = '___mine-1-2';
            const mine = new Mine(1, 2);
            assert.equal(mine.element.id, expectedId);
        });
    });
});
