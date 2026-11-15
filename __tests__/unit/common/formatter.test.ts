import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatClass, formatId } from '../../../src/common/formatter.js';

void describe('formatId による ID 生成', () => {
    void it('接頭辞、引数、接尾辞をハイフンで連結する', () => {
        assert.equal(formatId('cell', 'id', 1, 'row'), 'cell-1-row-id');
    });

    void it('接尾辞が undefined の場合は省略する', () => {
        assert.equal(formatId('board', undefined, 'header'), 'board-header');
    });

    void it('引数がない場合も接頭辞と接尾辞を整形する', () => {
        assert.equal(formatId('board', 'header'), 'board-header');
    });
});

void describe('formatClass によるクラス名生成', () => {
    void it('接頭辞、引数、接尾辞をアンダースコアで連結する', () => {
        assert.equal(formatClass('board', 'cell', 'status', 2), 'board_status_2_cell');
    });

    void it('接尾辞が undefined の場合は省略する', () => {
        assert.equal(formatClass('status', undefined, 'open'), 'status_open');
    });

    void it('引数がない場合も接頭辞と接尾辞を整形する', () => {
        assert.equal(formatClass('board', 'cell'), 'board_cell');
    });
});
