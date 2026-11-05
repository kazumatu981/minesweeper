import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    createRandom,
    createRandomCoordinates,
    createRandomString,
} from '../../../src/common/random.js';

void describe('unittest: createRandom', () => {
    void it('should generate 200 values between the minimum and maximum', () => {
        const minimum = 3;
        const maximum = 10;

        for (let attempt = 0; attempt < 200; attempt++) {
            const result = createRandom(minimum, maximum);

            assert.ok(result >= minimum);
            assert.ok(result <= maximum);
        }
    });

    void it('should not generate values included in previous', () => {
        const minimum = 0;
        const maximum = 10;
        const previous = [0, 1, 2, 3, 4];

        for (let attempt = 0; attempt < 200; attempt++) {
            const result = createRandom(minimum, maximum, previous);

            assert.ok(result >= minimum);
            assert.ok(result <= maximum);
            assert.equal(previous.includes(result), false);
        }
    });
});

void describe('unittest: createRandomCoordinates', () => {
    void it('should return the requested number of coordinates', () => {
        const size = 10;
        const count = 20;

        assert.equal(createRandomCoordinates(size, count).length, count);
    });

    void it('should keep both coordinate axes within the board range', () => {
        const size = 10;
        const coordinates = createRandomCoordinates(size, 20);

        coordinates.forEach(({ x, y }) => {
            assert.ok(x >= 0);
            assert.ok(x < size);
            assert.ok(y >= 0);
            assert.ok(y < size);
        });
    });

    void it('should generate distinct coordinates', () => {
        const coordinates = createRandomCoordinates(10, 50);
        const uniqueCoordinates = new Set(
            coordinates.map(({ x, y }) => `${x},${y}`)
        );

        assert.equal(uniqueCoordinates.size, coordinates.length);
    });

    void it('should generate 200 distinct coordinate patterns', () => {
        const size = 10;
        const count = 10;
        const patterns = new Set<string>();

        for (let attempt = 0; attempt < 200; attempt++) {
            const coordinates = createRandomCoordinates(size, count);
            const pattern = coordinates
                .map(({ x, y }) => `${x},${y}`)
                .sort()
                .join(';');

            patterns.add(pattern);
        }

        assert.equal(patterns.size, 200);
    });
});

void describe('unittest: createRandomString', () => {
    void it('should return a string with the requested length', () => {
        const length = 20;

        assert.equal(createRandomString(length, 'abcdef').length, length);
    });

    void it('should only contain characters from the given character set', () => {
        const characters = 'abcdef';
        const result = createRandomString(20, characters);

        for (const character of result) {
            assert.ok(characters.includes(character));
        }
    });

    void it('should generate 200 distinct strings', () => {
        const length = 12;
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const results = new Set<string>();

        for (let attempt = 0; attempt < 200; attempt++) {
            results.add(createRandomString(length, characters));
        }

        assert.equal(results.size, 200);
    });
});
