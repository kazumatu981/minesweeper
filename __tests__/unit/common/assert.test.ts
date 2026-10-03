import { describe, suite, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import {
    AssertionError,
    __assertBetween,
    __assertSomeOf,
    __safeGetElementById,
} from '../../../src/common/assert.js';

void suite('unittest: __assertBetween', () => {
    void test('assert when small value.', () => {
        const test = -100;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
    void test('assert when when under minimum boundary.', () => {
        const test = -1;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
    void test('not assert when minimum boundary.', () => {
        const test = 0;
        const minimum = 0;
        const maximum = 100;

        __assertBetween(test, minimum, maximum);
    });
    void test('not assert when inner boundary.', () => {
        const test = 50;
        const minimum = 0;
        const maximum = 100;

        __assertBetween(test, minimum, maximum);
    });
    void test('not assert when maximum boundary.', () => {
        const test = 100;
        const minimum = 0;
        const maximum = 100;

        __assertBetween(test, minimum, maximum);
    });
    void test('assert when when over maximum boundary.', () => {
        const test = 101;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
    void test('assert when when large value.', () => {
        const test = 300;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
});

void suite('unittest: __assertSomeOf<T>', () => {
    void describe('some of number', () => {
        void test('not assert on included', () => {
            __assertSomeOf(1, [1, 2, 3]);
        });
        void test('assert on not include', () => {
            assert.throws(() => {
                __assertSomeOf(0, [1, 2, 3]);
            }, AssertionError);
        });
    });
    void describe('some of string', () => {
        void test('not assert on included', () => {
            __assertSomeOf('1', ['1', '2', '3']);
        });
        void test('assert on not include', () => {
            assert.throws(() => {
                __assertSomeOf('0', ['1', '2', '3']);
            }, AssertionError);
        });
    });
});

void suite('unittest: __safeGetElementById', () => {
    const defaultDocument = globalThis.document;
    let dom = undefined;
    let mockDocument;
    const theElementId = 'theElement';

    beforeEach(() => {
        dom = new JSDOM(
            `<!DOCTYPE html><div id='${theElementId}'>Hello world</div>`
        );
        mockDocument = dom.window.document;
        globalThis.document = mockDocument;
    });

    afterEach(() => {
        globalThis.document = defaultDocument;
    });

    void test('not assert on element founded', () => {
        __safeGetElementById(theElementId);
    });

    void test('assert on not element founded', () => {
        assert.throws(() => {
            __safeGetElementById(`__${theElementId}`);
        }, AssertionError);
    });
});
