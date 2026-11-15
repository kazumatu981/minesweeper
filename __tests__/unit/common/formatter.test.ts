import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatClass, formatId } from '../../../src/common/formatter.js';

void describe('unittest: formatId', () => {
    void it('should join the prefix, arguments, and suffix with hyphens', () => {
        assert.equal(formatId('cell', 'id', 1, 'row'), 'cell-1-row-id');
    });

    void it('should omit an undefined suffix', () => {
        assert.equal(formatId('board', undefined, 'header'), 'board-header');
    });

    void it('should format the prefix and suffix when there are no arguments', () => {
        assert.equal(formatId('board', 'header'), 'board-header');
    });
});

void describe('unittest: formatClass', () => {
    void it('should join the prefix, arguments, and suffix with underscores', () => {
        assert.equal(formatClass('board', 'cell', 'status', 2), 'board_status_2_cell');
    });

    void it('should omit an undefined suffix', () => {
        assert.equal(formatClass('status', undefined, 'open'), 'status_open');
    });

    void it('should format the prefix and suffix when there are no arguments', () => {
        assert.equal(formatClass('board', 'cell'), 'board_cell');
    });
});
