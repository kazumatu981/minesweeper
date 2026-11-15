import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    createRandom,
    createRandomCoordinates,
    createRandomString,
} from '../../../src/common/random.js';

void describe('createRandom による乱数生成', () => {
    void it('200 回生成した値が最小値から最大値の範囲内に収まる', () => {
        const minimum = 3;
        const maximum = 10;

        for (let attempt = 0; attempt < 200; attempt++) {
            const result = createRandom(minimum, maximum);

            assert.ok(result >= minimum);
            assert.ok(result <= maximum);
        }
    });

    void it('除外対象の値を生成しない', () => {
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

void describe('createRandomCoordinates による座標生成', () => {
    void it('指定した数の座標を返す', () => {
        const size = 10;
        const count = 20;

        assert.equal(createRandomCoordinates(size, count).length, count);
    });

    void it('両方の座標軸を盤面の範囲内に収める', () => {
        const size = 10;
        const coordinates = createRandomCoordinates(size, 20);

        coordinates.forEach(({ x, y }) => {
            assert.ok(x >= 0);
            assert.ok(x < size);
            assert.ok(y >= 0);
            assert.ok(y < size);
        });
    });

    void it('重複しない座標を生成する', () => {
        const coordinates = createRandomCoordinates(10, 50);
        const uniqueCoordinates = new Set(
            coordinates.map(({ x, y }) => `${x},${y}`)
        );

        assert.equal(uniqueCoordinates.size, coordinates.length);
    });

    void it('200 回の生成で異なる座標の組み合わせを返す', () => {
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

void describe('createRandomString による文字列生成', () => {
    void it('指定した長さの文字列を返す', () => {
        const length = 20;

        assert.equal(createRandomString(length, 'abcdef').length, length);
    });

    void it('指定した文字集合の文字だけを含む', () => {
        const characters = 'abcdef';
        const result = createRandomString(20, characters);

        for (const character of result) {
            assert.ok(characters.includes(character));
        }
    });

    void it('200 回の生成で異なる文字列を返す', () => {
        const length = 12;
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const results = new Set<string>();

        for (let attempt = 0; attempt < 200; attempt++) {
            results.add(createRandomString(length, characters));
        }

        assert.equal(results.size, 200);
    });
});
