/* eslint-disable max-statements */
import { describe, it, beforeEach, mock, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
    MINE_STATES,
    type MineEvent,
} from '../../../src/components/utils/index.js';
import { Mine } from '../../../src/components/mine.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../util/document_mock.js';

void describe('Mine state', () => {
    const onStateChangeMock = mock.fn();
    const onBombTouchMock = mock.fn();
    const onResolvedMock = mock.fn();

    function mockEvents(mine: Mine): void {
        mine.on('state-change', onStateChangeMock);
        mine.on('bombed', onBombTouchMock);
        mine.on('resolved', onResolvedMock);
    }
    function resetCalls() {
        onStateChangeMock.mock.resetCalls();
        onBombTouchMock.mock.resetCalls();
        onResolvedMock.mock.resetCalls();
    }

    function assertCalled(calledCount: Record<MineEvent, number>) {
        assert.equal(
            onStateChangeMock.mock.calls.length,
            calledCount['state-change']
        );
        assert.equal(onBombTouchMock.mock.calls.length, calledCount['bombed']);
        assert.equal(onResolvedMock.mock.calls.length, calledCount['resolved']);
    }

    let mocker: Mocker;
    before(() => {
        mocker = mockDocument();
    });

    after(() => {
        restoreDocument();
    });
    beforeEach(() => {
        resetCalls();
    });

    void it('[initialize]', () => {
        const mine = new Mine(1, 1);
        mockEvents(mine);

        // assert state
        assert.equal(mine.state, MINE_STATES.closed);

        // assert call count
        assertCalled({
            'state-change': 0,
            resolved: 0,
            bombed: 0,
        });
    });

    void describe('[touch]', () => {
        void it("'closed' --> 'touched' when not a bomb", () => {
            const mine = new Mine(1, 1);
            mockEvents(mine);

            // test
            mine.touch();

            // test state
            assert.equal(mine.state, MINE_STATES.touched);
            // test call count
            assertCalled({
                'state-change': 1,
                resolved: 1,
                bombed: 0,
            });
        });

        void it("'closed' --> 'touched' when it is a bomb", () => {
            const mine = new Mine(1, 1);
            mine.isBomb = true;
            mockEvents(mine);

            // test
            mine.touch();

            // test state
            assert.equal(mine.state, MINE_STATES.closed);
            // test call count
            assertCalled({
                'state-change': 0,
                resolved: 0,
                bombed: 0,
            });
        });
    });

    void describe('[right click]', () => {
        void it("cycle trough 'closed' --> 'mustBe' --> 'mayBe' --> 'closed' when is NOT a bomb.", () => {
            const mine = new Mine(1, 1);
            mockEvents(mine);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mustBe);
            assertCalled({
                'state-change': 1,
                bombed: 0,
                resolved: 0,
            });

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mayBe);
            assertCalled({
                'state-change': 2,
                bombed: 0,
                resolved: 0,
            });

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.closed);
            assertCalled({
                'state-change': 3,
                bombed: 0,
                resolved: 0,
            });
        });
        void it("cycle trough 'closed' --> 'mustBe' --> 'mayBe' --> 'closed' when is a bomb.", () => {
            const mine = new Mine(1, 1);
            mine.isBomb = true;
            mockEvents(mine);

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mustBe);
            assertCalled({
                'state-change': 1,
                bombed: 0,
                resolved: 0,
            });

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.mayBe);
            assertCalled({
                'state-change': 2,
                bombed: 0,
                resolved: 0,
            });

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.closed);
            assertCalled({
                'state-change': 3,
                bombed: 0,
                resolved: 0,
            });
        });
        void it('opened state, right click does nothing', () => {
            const mine = new Mine(1, 1);
            mockEvents(mine);

            // click
            mocker.dispatchMouseEvent(mine.element, 'click');
            resetCalls();

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.opened);
            assertCalled({
                'state-change': 0,
                bombed: 0,
                resolved: 0,
            });
        });
        void it('bomb state, right click does nothing', () => {
            const mine = new Mine(1, 1);
            mine.isBomb = true;
            mockEvents(mine);

            // click
            mocker.dispatchMouseEvent(mine.element, 'click');
            resetCalls();

            // right click
            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, MINE_STATES.bomb);
            assertCalled({
                'state-change': 0,
                bombed: 0,
                resolved: 0,
            });
        });
    });
    void describe('[click]', () => {
        void describe('state: closed', () => {
            void it("when it's not a bomb, goes to 'open' state", () => {
                const mine = new Mine(1, 1);
                mockEvents(mine);

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.opened);
                assertCalled({
                    'state-change': 1,
                    resolved: 1,
                    bombed: 0,
                });
            });
            void it("when it's a bomb, goes to 'bomb' state", () => {
                const mine = new Mine(1, 1);
                mine.isBomb = true;
                mockEvents(mine);

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.bomb);
                assertCalled({
                    'state-change': 1,
                    resolved: 0,
                    bombed: 1,
                });
            });
        });
        void describe('state: touched', () => {
            void it('not change state. not called events', () => {
                const mine = new Mine(1, 1);
                mockEvents(mine);

                mine.touch();
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.touched);
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                });
            });
        });
        void describe('state: mayBe', () => {
            void it("when it's not a bomb, goes to 'open' state", () => {
                const mine = new Mine(1, 1);
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.opened);
                assertCalled({
                    'state-change': 1,
                    resolved: 1,
                    bombed: 0,
                });
            });
            void it("when it's a bomb, goes to 'bomb' state", () => {
                const mine = new Mine(1, 1);
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.bomb);
                assertCalled({
                    'state-change': 1,
                    resolved: 0,
                    bombed: 1,
                });
            });
        });
        void describe('state: mustBe', () => {
            void it("when  it's not a bomb, no state change", () => {
                const mine = new Mine(1, 1);
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.mustBe);
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                });
            });
            void it("when it's a bomb, no state change", () => {
                const mine = new Mine(1, 1);
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.mustBe);
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                });
            });
        });
        void describe('state: bomb', () => {
            void it("when  it's a bomb, no state change", () => {
                const mine = new Mine(1, 1);
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'click');
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.bomb);
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                });
            });
        });
        void describe('state: open', () => {
            void it("when  it's opened, no state change", () => {
                const mine = new Mine(1, 1);
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'click');
                resetCalls();

                // click
                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, MINE_STATES.opened);
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                });
            });
        });
    });
});
