import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MineField } from '../../../src/components/mine-field.js';
import { Scoreboard } from '../../../src/components/scoreboard.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../util/document_mock.js';

void describe('Scoreboard の振る舞い', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void it('Tableタグと4項目のスコア行を生成する', () => {
        const field = new MineField({
            size: 2,
            bombs: [{ rowId: 0, colId: 0 }],
        });
        const scoreboard = new Scoreboard(field);

        assert.equal(scoreboard.element.tagName, 'TABLE');
        assert.equal(scoreboard.element.querySelectorAll('tr').length, 4);
        assert.equal(scoreboard.element.querySelectorAll('th').length, 4);
        assert.equal(scoreboard.element.querySelectorAll('td').length, 4);
        assert.deepEqual(scoreboard.score, field.score);
    });

    void it('MineFieldのscore-changedイベントで表示を更新する', () => {
        const field = new MineField({
            size: 2,
            bombs: [{ rowId: 0, colId: 0 }],
        });
        const scoreboard = new Scoreboard(field);

        mocker.dispatchMouseEvent(
            field.mine({ rowId: 0, colId: 0 }).element,
            'contextmenu'
        );

        assert.equal(scoreboard.score.flagged, 1);
        assert.equal(
            scoreboard.element.querySelector('[data-score="flagged"]')
                ?.textContent,
            '1'
        );
    });

    void it('スコアを直接更新できる', () => {
        const scoreboard = new Scoreboard();
        scoreboard.updateScore({
            total: 4,
            flagged: 1,
            estimated: 2,
            remained: 1,
        });

        assert.deepEqual(scoreboard.score, {
            total: 4,
            flagged: 1,
            estimated: 2,
            remained: 1,
        });
    });
});
