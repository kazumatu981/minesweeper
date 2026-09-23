/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-nested-callbacks */
import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
    Mine,
    MINE_STATE_CLOSED,
    MINE_STATE_MAY_BE_BOMB,
    MINE_STATE_MUST_BE_BOMB,
    MINE_STATE_OPENED,
    MINE_EVENT_STATE_CHANGE,
    MINE_EVENT_BOOM,
    MINE_STATES,
    MINE_STATE_BOMB,
} from '../../../parts/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

describe('Mine: events', () => {
    let mockDoc;

    beforeEach(() => {
        mockDoc = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    /**
     *
     */
    describe(`event: ${MINE_EVENT_STATE_CHANGE}`, () => {
        [
            MINE_STATE_MAY_BE_BOMB,
            MINE_STATE_MUST_BE_BOMB,
            MINE_STATE_OPENED,
        ].forEach((expectedState) => {
            it(`change to ${expectedState}`, () => {
                const mine = new Mine(1, 2);
                const onChanged = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);

                // set state
                mine.state = expectedState;

                // validate
                assert.equal(mine.state, expectedState);
                assert.equal(onChanged.mock.calls.length, 1);
                assert.equal(onChanged.mock.calls[0].arguments[0], mine);
            });
        });
        it('if not state is not changed, then not fired', () => {
            const mine = new Mine(1, 2);
            const onChanged = mock.fn();
            mine.on(MINE_EVENT_STATE_CHANGE, onChanged);

            // set state
            mine.state = MINE_STATE_CLOSED;

            // validate
            assert.equal(mine.state, MINE_STATE_CLOSED);
            assert.equal(onChanged.mock.calls.length, 0);
        });
    });

    describe(`event: ${MINE_EVENT_BOOM}`, () => {
        it('if isBomb is true, close --> open --> boom', () => {
            const mine = new Mine(1, 2);
            // イベント登録
            const onBoom = mock.fn();
            mine.on(MINE_EVENT_BOOM, onBoom);
            // 爆弾を仕掛ける
            mine.isBomb = true;

            // 開く
            mine.state = MINE_STATE_BOMB;

            // 確認
            assert.equal(onBoom.mock.calls.length, 1);
            assert.equal(onBoom.mock.calls[0].arguments[0], mine);
        });
        it('if isBomb is false, close --> open --> not boom', () => {
            const mine = new Mine(1, 2);
            // イベント登録
            const onBoom = mock.fn();
            mine.on(MINE_EVENT_BOOM, onBoom);
            // 爆弾を仕掛ける
            mine.isBomb = false;

            // 開く
            mine.state = MINE_STATE_OPENED;

            // 確認
            assert.equal(onBoom.mock.calls.length, 0);
        });
    });

    describe('mouseClickEvent', () => {
        describe('right click', () => {
            it('on closed, goes to mustBe', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.state = MINE_STATES.closed;
                onChanged.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('contextmenu')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.mustBe);
                assert.equal(onChanged.mock.calls.length, 1);
            });
            it('on mustBe, goes to Maybe', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.state = MINE_STATES.mustBe;
                onChanged.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('contextmenu')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.mayBe);
                assert.equal(onChanged.mock.calls.length, 1);
            });
            it('on mayBe, goes to closed', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.state = MINE_STATES.mayBe;
                onChanged.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('contextmenu')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.closed);
                assert.equal(onChanged.mock.calls.length, 1);
            });
            it('on opened, goes to opened', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.state = MINE_STATES.opened;
                onChanged.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('contextmenu')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.opened);
                assert.equal(onChanged.mock.calls.length, 0);
            });
        });

        describe('left click', () => {
            it('on closed, goes to open and if isBomb is false not called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.closed;
                mine.isBomb = false;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.opened);
                assert.equal(onChanged.mock.calls.length, 1);
                assert.equal(onBoom.mock.calls.length, 0);
            });
            it('on closed, goes to open and if isBomb is true called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.closed;
                mine.isBomb = true;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.bomb);
                assert.equal(onChanged.mock.calls.length, 1);
                assert.equal(onBoom.mock.calls.length, 1);
            });
            it('on myBe, goes to open and if isBomb is false not called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.mayBe;
                mine.isBomb = false;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.opened);
                assert.equal(onChanged.mock.calls.length, 1);
                assert.equal(onBoom.mock.calls.length, 0);
            });
            it('on mayBe, goes to open and if isBomb is true called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.mayBe;
                mine.isBomb = true;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.bomb);
                assert.equal(onChanged.mock.calls.length, 1);
                assert.equal(onBoom.mock.calls.length, 1);
            });
            it('on mustBe, goes to mustBe and if isBomb is false not called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.mustBe;
                mine.isBomb = false;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.mustBe);
                assert.equal(onChanged.mock.calls.length, 0);
                assert.equal(onBoom.mock.calls.length, 0);
            });
            it('on mustBe, goes to mustBe and if isBomb is true not called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.mustBe;
                mine.isBomb = true;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.mustBe);
                assert.equal(onChanged.mock.calls.length, 0);
                assert.equal(onBoom.mock.calls.length, 0);
            });
            it('on opened, goes to opened and if isBomb is false not called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.mustBe;
                mine.isBomb = false;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.mustBe);
                assert.equal(onChanged.mock.calls.length, 0);
                assert.equal(onBoom.mock.calls.length, 0);
            });
            it('on opened, goes to opened and if isBomb is true not called onBomb', () => {
                // initialize
                const mine = new Mine(1, 3);
                const onChanged = mock.fn();
                const onBoom = mock.fn();
                mine.on(MINE_EVENT_STATE_CHANGE, onChanged);
                mine.on(MINE_EVENT_BOOM, onBoom);
                mine.state = MINE_STATES.mustBe;
                mine.isBomb = true;
                onChanged.mock.resetCalls();
                onBoom.mock.resetCalls();

                // run
                mine.element.dispatchEvent(
                    new mockDoc.dom.window.MouseEvent('click')
                );

                // validate
                assert.equal(mine.state, MINE_STATES.mustBe);
                assert.equal(onChanged.mock.calls.length, 0);
                assert.equal(onBoom.mock.calls.length, 0);
            });
        });
    });
});
