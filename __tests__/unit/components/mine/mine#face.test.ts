import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../../src/components/mine.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../../util/document_mock.js';

void describe('Mine face', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('text and classes by state', () => {
        void it('uses the closed face initially', () => {
            const mine = new Mine(1, 1);

            assert.equal(mine.text, ' ');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_closed',
            ]);
        });

        void it('shows F and the mustBe class when flagged', () => {
            const mine = new Mine(1, 1);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');

            assert.equal(mine.text, 'F');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_mustBe',
            ]);
        });

        void it('shows ? and the mayBe class when marked as a question', () => {
            const mine = new Mine(1, 1);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');

            assert.equal(mine.text, '?');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_mayBe',
            ]);
        });

        void it('shows the neighbor count and opened classes when opened', () => {
            const mine = new Mine(1, 1);
            mine.neighborCount = 3;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.equal(mine.text, '3');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_opened',
                '___mine_neighbor_3',
            ]);
        });

        void it('shows the neighbor count and touched classes when touched', () => {
            const mine = new Mine(1, 1);
            mine.neighborCount = 2;

            mine.touch();

            assert.equal(mine.text, '2');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_touched',
                '___mine_neighbor_2',
            ]);
        });

        void it('shows B and the bomb class when a bomb is opened', () => {
            const mine = new Mine(1, 1);
            mine.isBomb = true;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.equal(mine.text, 'B');
            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_bomb',
            ]);
        });
    });
});
