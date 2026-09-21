/* eslint-disable max-statements */
import { Mine, MINE_STATES, MINE_EVENTS } from '../../parts/mine.js';

// ドキュメントをすべて読み込んだら onPageLoad関数を呼び出す
document.addEventListener('DOMContentLoaded', onPageLoad);

/**
 * ページが読み込まれたときに呼び出される関数
 */
function onPageLoad() {
    const testPanel1 = document.getElementById('test001');
    const mine0_0 = new Mine(0, 0);
    const mine0_1 = new Mine(0, 1);
    const mine0_2 = new Mine(0, 2);
    testPanel1.appendChild(mine0_0.element);
    testPanel1.appendChild(mine0_1.element);
    testPanel1.appendChild(mine0_2.element);

    mine0_0.state = MINE_STATES.closed;
    mine0_1.state = MINE_STATES.opened;
    mine0_2.state = MINE_STATES.closed;
    mine0_2.isBomb = true;

    [mine0_0, mine0_1, mine0_2].forEach((mine) => {
        mine.on(MINE_EVENTS['state-change'], (thisMine) => {
            console.log(`state changed: ${thisMine.id}`);
        });
        mine.on(MINE_EVENTS.boom, (thisMine) => {
            console.log(`boom: ${thisMine.id}`);
        });
    });
    const testPanel2 = document.getElementById('test002');

    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((index) => {
        const mine = new Mine(1, index);
        testPanel2.appendChild(mine.element);
        mine.neighborCount = index;
        mine.state = MINE_STATES.closed;
    });
}
