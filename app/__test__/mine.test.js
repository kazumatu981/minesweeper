import { Mine, MINE_STATES } from '../parts/mine.js';

// ドキュメントをすべて読み込んだら onPageLoad関数を呼び出す
document.addEventListener('DOMContentLoaded', onPageLoad);

/**
 * ページが読み込まれたときに呼び出される関数
 */
function onPageLoad() {
    const testPanel1 = document.getElementById('test001');
    const mine0_0 = new Mine(0, 0);
    const mine0_1 = new Mine(0, 1);
    testPanel1.appendChild(mine0_0.element);
    testPanel1.appendChild(mine0_1.element);

    mine0_0.state = MINE_STATES.closed;
    mine0_1.state = MINE_STATES.opened;

    const testPanel2 = document.getElementById('test002');

    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((index) => {
        const mine = new Mine(1, index);
        testPanel2.appendChild(mine.element);
        mine.neighborCount = index;
        mine.state = MINE_STATES.estimated;
    });
}
