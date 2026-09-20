import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
    Mine,
    MINE_STATE_CLOSED,
    MINE_STATE_MAY_BE_BOMB,
    MINE_STATE_MUST_BE_BOMB,
    MINE_STATE_OPENED,
} from '../../../parts/mine.js';
import { mockDocument, restoreDocument } from '../util/document_mock.js';

describe('Mine', () => {
    let mockDoc;

    beforeEach(() => {
        mockDoc = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    it('should be initialized with the correct row and column IDs', () => {
        const expectedId = '___mine-1-2';

        const mine = new Mine(1, 2);

        assert.equal(mine.id, expectedId);
        assert.equal(mockDoc.createElement.mock.calls.length, 1);
        assert.equal(mockDoc.createElement.mock.calls[0].arguments[0], 'div');
    });

    describe('currentFace', () => {
        describe('state = closed', () => {});
        describe('state = must-be', () => {});
        describe('state = may-be', () => {});
        describe('state = may-open', () => {});
    });
});
