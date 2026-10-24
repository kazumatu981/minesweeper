import { MineField } from '../../../../src/components/mine-field.js';

// ドキュメントをすべて読み込んだら onPageLoad関数を呼び出す
document.addEventListener('DOMContentLoaded', onPageLoad);

/**
 * ページが読み込まれたときに呼び出される関数
 */
function onPageLoad() {
    // テストパネルを用意する
    const testPanel = document.getElementById('testPanel');

    const field = new MineField({
        size: 15,
        mineCount: 30,
    });

    testPanel?.appendChild(field.element);
}
