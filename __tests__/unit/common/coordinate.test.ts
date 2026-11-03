import {
    type Coordinate,
    __assertCoordinateInRange,
    getNeighbor,
} from '../../../src/common/coordinate.js';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

void describe('unittest: __assertCoordinateInRange', () => {
    void it('should not throw when coordinate is in range', () => {
        const coordinate: Coordinate = { x: 1, y: 1 };
        const size = 3;
        assert.doesNotThrow(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });

    void it('should throw when coordinate is out of range. x-axis', () => {
        const coordinate: Coordinate = { x: 3, y: 1 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
    void it('should throw when coordinate is out of range. y-axis', () => {
        const coordinate: Coordinate = { x: 1, y: 3 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
    void it('should throw when coordinate is out of range. both axes', () => {
        const coordinate: Coordinate = { x: 3, y: 3 };
        const size = 3;
        assert.throws(() => {
            __assertCoordinateInRange(coordinate, size);
        });
    });
    void it('should throw when coordinate is negative', () => {
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

void describe('unittest: getNeighbor', () => {
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
        void it(`should return correct neighbors for test case ${index + 1}`, () => {
            const result = getNeighbor(testCase.coordinate, testCase.size);
            assert.deepEqual(result, testCase.expected);
        });
    });
});
