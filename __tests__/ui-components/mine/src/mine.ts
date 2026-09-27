/* eslint-disable max-statements */
import { Mine } from '../../../../src/components/mine.js';

// ドキュメントをすべて読み込んだら onPageLoad関数を呼び出す
document.addEventListener('DOMContentLoaded', onPageLoad);

/**
 * ページが読み込まれたときに呼び出される関数
 */
function onPageLoad() {
    const testPanel1 = document.getElementById('testPanel1');
    const testPanel2 = document.getElementById('testPanel2');
    if (!testPanel1 || !testPanel2) throw new Error("'testPanel' not found.");

    const mine0_0 = new Mine(0, 0);
    const mine0_1 = new Mine(0, 1);
    const mine0_2 = new Mine(0, 2);
    testPanel1.appendChild(mine0_0.element);
    testPanel1.appendChild(mine0_1.element);
    testPanel1.appendChild(mine0_2.element);

    mine0_1.setNeighborCount(6);
    mine0_1.touch();

    mine0_2.setBomb();

    [mine0_0, mine0_1, mine0_2].forEach((mine) => {
        mine.on('state-change', {
            action: (thisMine) => {
                console.log(
                    `mine state changed: id=${thisMine.id}, state=${thisMine.state}`
                );
            },
        });
        mine.on('boom', {
            action: (thisMine) => {
                console.log(`mine boom: id=${thisMine.id}`);
            },
        });
    });

    const mines1 = Array.from({ length: 10 }).map((_, index) => {
        const mine = new Mine(1, index);

        mine.setNeighborCount(index);
        mine.touch();

        testPanel2.appendChild(mine.element);
    });
}
