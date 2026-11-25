/* eslint-disable max-lines */
/* eslint-disable max-statements */
import { describe, it, beforeEach, mock, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Mine, type MineEvent } from '../../../../src/components/mine.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../../util/document_mock.js';

void describe('Mine の状態遷移', () => {
    const onStateChangeMock = mock.fn();
    const onBombTouchMock = mock.fn();
    const onResolvedMock = mock.fn();
    const onOpenedMock = mock.fn();

    function mockEvents(mine: Mine): void {
        mine.on('state-change', onStateChangeMock);
        mine.on('resolved', onResolvedMock);
        mine.on('bombed', onBombTouchMock);
        mine.on('opened', onOpenedMock);
    }
    function resetCalls() {
        onStateChangeMock.mock.resetCalls();
        onBombTouchMock.mock.resetCalls();
        onResolvedMock.mock.resetCalls();
        onOpenedMock.mock.resetCalls();
    }

    function assertCalled(calledCount: Record<MineEvent, number>) {
        assert.equal(
            onStateChangeMock.mock.calls.length,
            calledCount['state-change']
        );
        assert.equal(onBombTouchMock.mock.calls.length, calledCount['bombed']);
        assert.equal(onResolvedMock.mock.calls.length, calledCount['resolved']);
        assert.equal(onOpenedMock.mock.calls.length, calledCount['opened']);
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

    void it('生成直後は closed 状態で、イベントを通知しない', () => {
        const mine = new Mine({ rowId: 1, colId: 1 });
        mockEvents(mine);

        assert.equal(mine.state, 'closed');

        assertCalled({
            'state-change': 0,
            resolved: 0,
            bombed: 0,
            opened: 0,
        });
    });

    void it('reset すると初期状態に戻り、状態変更イベントを通知する', () => {
        const mine = new Mine({ rowId: 1, colId: 1 });
        mockEvents(mine);
        mine.neighborCount = 2;
        mine.touch();
        mine.isBomb = true;
        resetCalls();

        mine.reset();

        assert.equal(mine.state, 'closed');
        assert.equal(mine.isBomb, false);
        assert.equal(mine.neighborCount, 0);
        assertCalled({
            'state-change': 1,
            resolved: 0,
            bombed: 0,
            opened: 0,
        });
    });

    void describe('touch の振る舞い', () => {
        void it('地雷でないマスに触れると touched 状態になり、関連イベントを通知する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mockEvents(mine);

            mine.touch();

            assert.equal(mine.state, 'touched');
            assertCalled({
                'state-change': 1,
                resolved: 1,
                bombed: 0,
                opened: 0,
            });
        });

        void it('地雷に触れても状態とイベントは変化しない', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.isBomb = true;
            mockEvents(mine);

            mine.touch();

            assert.equal(mine.state, 'closed');
            assertCalled({
                'state-change': 0,
                resolved: 0,
                bombed: 0,
                opened: 0,
            });
        });
    });

    void describe('右クリック時の状態遷移', () => {
        void it('地雷でないマスは closed → mustBe → mayBe → closed と遷移する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mockEvents(mine);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'mustBe');
            assertCalled({
                'state-change': 1,
                bombed: 0,
                resolved: 1,
                opened: 0,
            });
            assert.deepEqual(onResolvedMock.mock.calls[0]?.arguments, [mine]);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'mayBe');
            assertCalled({
                'state-change': 2,
                bombed: 0,
                resolved: 1,
                opened: 0,
            });

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'closed');
            assertCalled({
                'state-change': 3,
                bombed: 0,
                resolved: 1,
                opened: 0,
            });
        });
        void it('地雷のマスも closed → mustBe → mayBe → closed と遷移する', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.isBomb = true;
            mockEvents(mine);

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'mustBe');
            assertCalled({
                'state-change': 1,
                bombed: 0,
                resolved: 1,
                opened: 0,
            });

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'mayBe');
            assertCalled({
                'state-change': 2,
                bombed: 0,
                resolved: 1,
                opened: 0,
            });

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'closed');
            assertCalled({
                'state-change': 3,
                bombed: 0,
                resolved: 1,
                opened: 0,
            });
        });
        void it('opened 状態では右クリックしても状態とイベントは変化しない', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mockEvents(mine);

            mocker.dispatchMouseEvent(mine.element, 'click');
            resetCalls();

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'opened');
            assertCalled({
                'state-change': 0,
                bombed: 0,
                resolved: 0,
                opened: 0,
            });
        });
        void it('bomb 状態では右クリックしても状態とイベントは変化しない', () => {
            const mine = new Mine({ rowId: 1, colId: 1 });
            mine.isBomb = true;
            mockEvents(mine);

            mocker.dispatchMouseEvent(mine.element, 'click');
            resetCalls();

            mocker.dispatchMouseEvent(mine.element, 'contextmenu');
            assert.equal(mine.state, 'bomb');
            assertCalled({
                'state-change': 0,
                bombed: 0,
                resolved: 0,
                opened: 0,
            });
        });
    });
    void describe('クリック時の状態遷移', () => {
        void describe('closed 状態', () => {
            void it('地雷でないマスをクリックすると opened 状態になる', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'opened');
                assertCalled({
                    'state-change': 1,
                    resolved: 1,
                    bombed: 0,
                    opened: 1,
                });
            });
            void it('地雷をクリックすると bomb 状態になる', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'bomb');
                assertCalled({
                    'state-change': 1,
                    resolved: 0,
                    bombed: 1,
                    opened: 0,
                });
            });
        });
        void describe('touched 状態', () => {
            void it('クリックしても状態とイベントは変化しない', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mockEvents(mine);

                mine.touch();
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'touched');
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                    opened: 0,
                });
            });
        });
        void describe('mayBe 状態', () => {
            void it('地雷でないマスをクリックすると opened 状態になる', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'opened');
                assertCalled({
                    'state-change': 1,
                    resolved: 1,
                    bombed: 0,
                    opened: 1,
                });
            });
            void it('地雷をクリックすると bomb 状態になる', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'bomb');
                assertCalled({
                    'state-change': 1,
                    resolved: 0,
                    bombed: 1,
                    opened: 0,
                });
            });
        });
        void describe('mustBe 状態', () => {
            void it('地雷でないマスをクリックしても状態は変化しない', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'mustBe');
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                    opened: 0,
                });
            });
            void it('地雷をクリックしても状態は変化しない', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'contextmenu');
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'mustBe');
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                    opened: 0,
                });
            });
        });
        void describe('bomb 状態', () => {
            void it('クリックしても状態は変化しない', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mine.isBomb = true;
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'click');
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'bomb');
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                    opened: 0,
                });
            });
        });
        void describe('opened 状態', () => {
            void it('クリックしても状態は変化しない', () => {
                const mine = new Mine({ rowId: 1, colId: 1 });
                mockEvents(mine);

                mocker.dispatchMouseEvent(mine.element, 'click');
                resetCalls();

                mocker.dispatchMouseEvent(mine.element, 'click');
                assert.equal(mine.state, 'opened');
                assertCalled({
                    'state-change': 0,
                    resolved: 0,
                    bombed: 0,
                    opened: 0,
                });
            });
        });
    });
});
