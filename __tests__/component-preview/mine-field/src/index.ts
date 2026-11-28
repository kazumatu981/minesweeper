import { MineField } from '../../../../src/components/mine-field.js';
import { ScoreManager } from '../../../../src/components/score-manager.js';
import { Scoreboard } from '../../../../src/components/scoreboard.js';

// ドキュメントをすべて読み込んだら onPageLoad関数を呼び出す
document.addEventListener('DOMContentLoaded', onPageLoad);

/**
 * ページが読み込まれたときに呼び出される関数
 */
function onPageLoad() {
    // テストパネルを用意する
    const testPanel = document.getElementById('testPanel');

    const scoreManager = new ScoreManager();
    const field = new MineField(
        {
            size: 10,
            bombCount: 15,
        },
        scoreManager
    );
    const scoreboard = new Scoreboard(scoreManager);

    field.on('ended', () => console.log('ended'));
    field.on('failed', () => console.log('failed'));
    field.on('score-changed', () =>
        console.log(`score: ${JSON.stringify(field.score)}`)
    );
    testPanel?.appendChild(scoreboard.element);
    testPanel?.appendChild(field.element);
}
