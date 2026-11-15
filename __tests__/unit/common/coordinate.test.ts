import {
    type Coordinate,
    __assertCoordinateInRange,
    getNeighbor,
    isCoordinateEqual,
} from '../../../src/common/coordinate.js';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

void describe('__assertCoordinateInRange による座標範囲の検証', () => {
    void it('座標が範囲内の場合は例外を投げない', () => {
        const coordinate: Coordinate = { x: 1, y: 1 };
        const size = 3;
        assert.doesNotThrow(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });

    void it('x 座標が範囲外の場合は例外を投げる', () => {
        const coordinate: Coordinate = { x: 3, y: 1 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
    void it('y 座標が範囲外の場合は例外を投げる', () => {
        const coordinate: Coordinate = { x: 1, y: 3 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
    void it('両方の座標が範囲外の場合は例外を投げる', () => {
        const coordinate: Coordinate = { x: 3, y: 3 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
    void it('座標が負の場合は例外を投げる', () => {
        const coordinate: Coordinate = { x: -1, y: -1 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
});

interface GetNeighborTestCase {
    coordinate: Coordinate;
    size: number;
    expected: Coordinate[];
}

void describe('getNeighbor による隣接座標の取得', () => {
    const testCases: GetNeighborTestCase[] = [
        {
            coordinate: { x: 1, y: 1 },
            size: 3,
            expected: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 0, y: 2 },
                { x: 1, y: 2 },
                { x: 2, y: 2 },
            ],
        },
        {
            coordinate: { x: 0, y: 0 },
            size: 3,
            expected: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
            ],
        },
        {
            coordinate: { x: 2, y: 2 },
            size: 3,
            expected: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 1, y: 2 },
                { x: 2, y: 2 },
            ],
        },
    ];
    testCases.forEach((testCase, index) => {
        void it(
            `ケース ${index + 1}（座標 ${testCase.coordinate.x}, ${testCase.coordinate.y}）の周囲に盤面内の座標を返す`,
            () => {
                const result = getNeighbor(testCase.coordinate, testCase.size);
                assert.deepEqual(result, testCase.expected);
            }
        );
    });
});

void describe('isCoordinateEqual による座標の比較', () => {
    void it('座標が等しい場合は true を返す', () => {
        assert.equal(
            isCoordinateEqual({ x: 1, y: 2 }, { x: 1, y: 2 }),
            true
        );
    });

    void it('x 座標が異なる場合は false を返す', () => {
        assert.equal(
            isCoordinateEqual({ x: 1, y: 2 }, { x: 2, y: 2 }),
            false
        );
    });

    void it('y 座標が異なる場合は false を返す', () => {
        assert.equal(
            isCoordinateEqual({ x: 1, y: 2 }, { x: 1, y: 3 }),
            false
        );
    });
});
