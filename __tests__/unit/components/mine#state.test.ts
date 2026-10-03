import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { MINE_STATES } from '../../../src/components/constants/index.js';
import { Mine } from '../../../src/components/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

void describe('Mine state', () => {
    const onStateChangeMock = mock.fn();
    const onBombTouchMock = mock.fn();
    beforeEach(() => {
        mockDocument();
        onStateChangeMock.mock.resetCalls();
        onBombTouchMock.mock.resetCalls();
    });

    afterEach(() => {
        restoreDocument();
    });

    void it("'closed' on initialize", () => {
        const mine = new Mine(1, 1);

        assert.equal(mine.state, MINE_STATES.closed);
    });
});
