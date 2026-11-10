import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../../src/components/mine.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../../util/document_mock.js';

void describe('Mine display', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void describe('text', () => {
        void it('shows a blank for the closed state', () => {
            const mine = new Mine(1, 1);

            assert.equal(mine.text, ' ');
        });

        void it('shows the flag and question mark for marked states', () => {
            const mine = new Mine(1, 1);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.text, 'F');

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.text, '?');
        });

        void it('shows the neighbor count, or blank when it is zero, when opened', () => {
            const mine = new Mine(1, 1);

            mine.neighborCount = 0;
            mocker.dispatchMouseEvent(mine.element, 'click');
            assert.equal(mine.text, ' ');

            mine.reset();
            mine.neighborCount = 3;
            mocker.dispatchMouseEvent(mine.element, 'click');
            assert.equal(mine.text, '3');
        });

        void it('shows the neighbor count, or blank when it is zero, when touched', () => {
            const mine = new Mine(1, 1);

            mine.neighborCount = 0;
            mine.touch();
            assert.equal(mine.text, ' ');

            mine.reset();
            mine.neighborCount = 3;
            mine.touch();
            assert.equal(mine.text, '3');
        });

        void it('shows B for a bomb', () => {
            const mine = new Mine(1, 1);
            mine.isBomb = true;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.equal(mine.text, 'B');
        });
    });

    void describe('classes', () => {
        void it('uses the base and closed-state classes initially', () => {
            const mine = new Mine(1, 1);

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_closed',
            ]);
        });

        void it('updates the state class for marked states', () => {
            const mine = new Mine(1, 1);

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

        void it('includes the neighbor-count class when opened', () => {
            const mine = new Mine(1, 1);
            mine.neighborCount = 3;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_opened',
                '___mine_neighbor_3',
            ]);
        });

        void it('includes the neighbor-count class when touched', () => {
            const mine = new Mine(1, 1);
            mine.neighborCount = 3;

            mine.touch();

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_touched',
                '___mine_neighbor_3',
            ]);
        });

        void it('uses the bomb-state class for a bomb', () => {
            const mine = new Mine(1, 1);
            mine.isBomb = true;

            mocker.dispatchMouseEvent(mine.element, 'click');

            assert.deepEqual(mine.classes, [
                '___mine_base',
                '___mine_state_bomb',
            ]);
        });
    });
});
