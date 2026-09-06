import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Mine } from '../../../parts/mine.js';
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
        const expectedId = '___mine___1-2';

        const mine = new Mine(1, 2);

        assert.equal(mine.id, expectedId);
        assert.equal(mockDoc.createElement.mock.calls.length, 1);
        assert.equal(mockDoc.createElement.mock.calls[0][0], 'div');
    });
});
