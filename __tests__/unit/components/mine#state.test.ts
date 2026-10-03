/* eslint-disable max-statements */
import {
    describe,
    it,
    beforeEach,
    // afterEach,
    mock,
    before,
    after,
} from 'node:test';
import assert from 'node:assert/strict';
import { MINE_STATES } from '../../../src/components/constants/index.js';
import { Mine } from '../../../src/components/mine.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../util/document_mock.js';

void describe('Mine state', () => {
    const onStateChangeMock = mock.fn();
    const onBombTouchMock = mock.fn();
    let mocker: Mocker;
    before(() => {
        mocker = mockDocument();
    });

    after(() => {
        restoreDocument();
    });
    beforeEach(() => {
        onStateChangeMock.mock.resetCalls();
        onBombTouchMock.mock.resetCalls();
    });

    void it("'closed' on initialize", () => {
        const mine = new Mine(1, 1);
        mine.on('state-change', onStateChangeMock);
        mine.on('boom', onBombTouchMock);

        assert.equal(mine.state, MINE_STATES.closed);
        assert.equal(onStateChangeMock.mock.calls.length, 0);
        assert.equal(onBombTouchMock.mock.calls.length, 0);
    });

    void it("'closed' --> 'touched' when not a bomb", () => {
        const mine = new Mine(1, 1);
        mine.on('state-change', onStateChangeMock);
        mine.on('boom', onBombTouchMock);

        mine.touch();

        assert.equal(mine.state, MINE_STATES.touched);
        assert.equal(onStateChangeMock.mock.calls.length, 1);
        assert.equal(onBombTouchMock.mock.calls.length, 0);
    });

    void it("'closed' --> 'touched' when it is a bomb", () => {
        const mine = new Mine(1, 1);
        mine.setBomb();
        mine.on('state-change', onStateChangeMock);
        mine.on('boom', onBombTouchMock);

        mine.touch();

        assert.equal(mine.state, MINE_STATES.touched);
        assert.equal(onStateChangeMock.mock.calls.length, 1);
        assert.equal(onBombTouchMock.mock.calls.length, 0);
    });

    void describe('right click events', () => {
        void it("not touched cycle trough 'closed' --> 'mustBe' --> 'mayBe' --> 'closed' when is NOT a bomb.", () => {
            const mine = new Mine(1, 1);
            mine.on('state-change', onStateChangeMock);
            mine.on('boom', onBombTouchMock);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mustBe);
            assert.equal(onStateChangeMock.mock.calls.length, 1);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mayBe);
            assert.equal(onStateChangeMock.mock.calls.length, 2);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.closed);
            assert.equal(onStateChangeMock.mock.calls.length, 3);
            assert.equal(onBombTouchMock.mock.calls.length, 0);
        });
        void it("not touch cycle trough 'closed' --> 'mustBe' --> 'mayBe' --> 'closed' when is a bomb.", () => {
            const mine = new Mine(1, 1);
            mine.setBomb();
            mine.on('state-change', onStateChangeMock);
            mine.on('boom', onBombTouchMock);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mustBe);
            assert.equal(onStateChangeMock.mock.calls.length, 1);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mayBe);
            assert.equal(onStateChangeMock.mock.calls.length, 2);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.closed);
            assert.equal(onStateChangeMock.mock.calls.length, 3);
            assert.equal(onBombTouchMock.mock.calls.length, 0);
        });
        void it("touched cycle trough 'closed' --> 'mustBe' --> 'mayBe' --> 'closed' when is NOT a bomb.", () => {
            const mine = new Mine(1, 1);
            mine.on('state-change', onStateChangeMock);
            mine.on('boom', onBombTouchMock);

            mine.touch();
            onStateChangeMock.mock.resetCalls();
            onBombTouchMock.mock.resetCalls();

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mustBe);
            assert.equal(onStateChangeMock.mock.calls.length, 1);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mayBe);
            assert.equal(onStateChangeMock.mock.calls.length, 2);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.touched);
            assert.equal(onStateChangeMock.mock.calls.length, 3);
            assert.equal(onBombTouchMock.mock.calls.length, 0);
        });
        void it("touched cycle trough 'closed' --> 'mustBe' --> 'mayBe' --> 'closed' when is a bomb.", () => {
            const mine = new Mine(1, 1);
            mine.setBomb();
            mine.on('state-change', onStateChangeMock);
            mine.on('boom', onBombTouchMock);

            mine.touch();
            onStateChangeMock.mock.resetCalls();
            onBombTouchMock.mock.resetCalls();

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mustBe);
            assert.equal(onStateChangeMock.mock.calls.length, 1);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mayBe);
            assert.equal(onStateChangeMock.mock.calls.length, 2);
            assert.equal(onBombTouchMock.mock.calls.length, 0);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.touched);
            assert.equal(onStateChangeMock.mock.calls.length, 3);
            assert.equal(onBombTouchMock.mock.calls.length, 0);
        });
    });
    void describe('click events', () => {});
});
