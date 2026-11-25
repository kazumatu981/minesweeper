import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../../util/document_mock.js';

/**
 * Mine の生成時に初期値と DOM 要素を検証する。
 */
void describe('Mine のコンストラクター', () => {
    beforeEach(() => {
        mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    /**
     * 各プロパティの初期値を検証する。
     */
    void describe('初期値', () => {
        void it('コンストラクターで指定した rowId と colId を保持する', () => {
            const mine = new Mine({ rowId: 2, colId: 3 });

            assert.equal(mine.rowId, 2);
            assert.equal(mine.colId, 3);
        });
        void it('state を closed で初期化する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });

            assert.equal(mine.state, 'closed');
        });
        void it('isBomb を false で初期化する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });

            assert.equal(mine.isBomb, false);
        });
        void it('neighborCount を 0 で初期化する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });
            assert.equal(mine.neighborCount, 0);
        });
        void it('element を生成する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });
            assert.notEqual(mine.element, undefined);
        });
        void it('rowId、colId、ランダム文字列を含む ID を生成する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });
            assert.match(mine.id, /^___mine-1-2-[A-Za-z0-9]{8}$/);
        });
    });

    /**
     * 生成した DOM 要素のタグ名と ID を検証する。
     */
    void describe('DOM 要素', () => {
        void it('DIV 要素を生成する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });

            assert.equal(mine.element.tagName.toLowerCase(), 'div');
        });
        void it('要素に座標とランダム文字列を含む ID を設定する', () => {
            const mine = new Mine({ rowId: 1, colId: 2 });
            assert.match(mine.element.id, /^___mine-1-2-[A-Za-z0-9]{8}$/);
        });
    });
});
