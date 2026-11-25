import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../../src/components/mine.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../../util/document_mock.js';

void describe('Mine の表示', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('テキスト', () => {
        void it('closed 状態では空白を表示する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });

            assert.equal(mine.text, ' ');
        });

        void it('マーク状態に応じて旗と疑問符を表示する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.text, 'F');

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.text, '?');
        });

        void it('開いたとき、隣接マス数を表示し、0 の場合は空白を表示する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });

            mine.neighborCount = 0;
            mocker.dispatchMouseEvent(mine.element, 'click');
            assert.equal(mine.text, ' ');

            mine.reset();
            mine.neighborCount = 3;
            mocker.dispatchMouseEvent(mine.element, 'click');
            assert.equal(mine.text, '3');
        });

        void it('触れたとき、隣接マス数を表示し、0 の場合は空白を表示する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });

            mine.neighborCount = 0;
            mine.touch();
            assert.equal(mine.text, ' ');

            mine.reset();
            mine.neighborCount = 3;
            mine.touch();
            assert.equal(mine.text, '3');
        });

        void it('地雷を開くと B を表示する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.isBomb = true;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.equal(mine.text, 'B');
        });
    });

    void describe('CSS クラス', () => {
        void it('初期状態では基底クラスと closed 状態のクラスを設定する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_closed',
            ]);
        });

        void it('マーク状態に応じて状態クラスを更新する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_mustBe',
            ]);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_mayBe',
            ]);
        });

        void it('開いたときに隣接マス数のクラスを含める', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.neighborCount = 3;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_opened',
                '___mine_neighbor_3',
            ]);
        });

        void it('触れたときに隣接マス数のクラスを含める', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.neighborCount = 3;

            mine.touch();

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_touched',
                '___mine_neighbor_3',
            ]);
        });

        void it('地雷を開いたときに地雷状態のクラスを設定する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.isBomb = true;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_bomb',
            ]);
        });
    });
});
