import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MineField } from '../../../src/components/mine-field.js';
import { Scoreboard } from '../../../src/components/scoreboard.js';
import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../util/document_mock.js';
import { ScoreManager } from '../../../src/components/score-manager.js';

void describe('Scoreboard の振る舞い', () => {
    let mocker: Mocker;

    beforeEach(() => {
        mocker = mockDocument();
    });

    afterEach(() => {
        restoreDocument();
    });

    void it('Tableタグと4項目のスコア行を生成する', () => {
        const scoreManager = new ScoreManager(5);
        const scoreboard = new Scoreboard(scoreManager);

        assert.equal(scoreboard.element.tagName, 'TABLE');
        assert.equal(scoreboard.element.querySelectorAll('tr').length, 5);
        assert.equal(scoreboard.element.querySelectorAll('th').length, 5);
        assert.equal(scoreboard.element.querySelectorAll('td').length, 5);
    });

    void it('MineFieldのscore-changedイベントで表示を更新する', () => {
        const scoreManager = new ScoreManager(4);
        const field = new MineField(
            {
                size: 2,
                bombs: [{ rowId: 0, colId: 0 }],
            },
            scoreManager
        );
        const scoreboard = new Scoreboard(scoreManager);

        mocker.dispatchMouseEvent(
            field.mine({ rowId: 0, colId: 0 }).element,
            'contextmenu'
        );

        assert.equal(field.score.flagged, 1);
        assert.equal(
            scoreboard.element.querySelector('.___scoreboard_flagged_value')
                ?.textContent,
            '1'
        );
    });

    // void it('スコアを直接更新できる', () => {
    //     const scoreboard = new Scoreboard();
    //     scoreboard.updateScore({
    //         total: 4,
    //         flagged: 1,
    //         estimated: 2,
    //         remained: 1,
    //     });

    //     assert.deepEqual(scoreboard.score, {
    //         total: 4,
    //         flagged: 1,
    //         estimated: 2,
    //         remained: 1,
    //     });
    // });
});
