import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import {
    AssertionError,
    __assertBetween,
    __assertSomeOf,
    __safeGetElementById,
} from '../../../src/common/assert.js';

void describe('__assertBetween による範囲検証', () => {
    void it('下限を大きく下回る値の場合は AssertionError を投げる', () => {
        const test = -100;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
    void it('下限を下回る値の場合は AssertionError を投げる', () => {
        const test = -1;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
    void it('下限値の場合は例外を投げない', () => {
        const test = 0;
        const minimum = 0;
        const maximum = 100;

        __assertBetween(test, minimum, maximum);
    });
    void it('範囲内の値の場合は例外を投げない', () => {
        const test = 50;
        const minimum = 0;
        const maximum = 100;

        __assertBetween(test, minimum, maximum);
    });
    void it('上限値の場合は例外を投げない', () => {
        const test = 100;
        const minimum = 0;
        const maximum = 100;

        __assertBetween(test, minimum, maximum);
    });
    void it('上限を超える値の場合は AssertionError を投げる', () => {
        const test = 101;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
    void it('上限を大きく超える値の場合は AssertionError を投げる', () => {
        const test = 300;
        const minimum = 0;
        const maximum = 100;

        assert.throws(() => {
            __assertBetween(test, minimum, maximum);
        }, AssertionError);
    });
});

void describe('__assertSomeOf による選択肢の検証', () => {
    void describe('数値の場合', () => {
        void it('選択肢に含まれる値では例外を投げない', () => {
            __assertSomeOf(1, [1, 2, 3]);
        });
        void it('選択肢に含まれない値では AssertionError を投げる', () => {
            assert.throws(() => {
                __assertSomeOf(0, [1, 2, 3]);
            }, AssertionError);
        });
    });
    void describe('文字列の場合', () => {
        void it('選択肢に含まれる値では例外を投げない', () => {
            __assertSomeOf('1', ['1', '2', '3']);
        });
        void it('選択肢に含まれない値では AssertionError を投げる', () => {
            assert.throws(() => {
                __assertSomeOf('0', ['1', '2', '3']);
            }, AssertionError);
        });
    });
});

void describe('__safeGetElementById による要素取得', () => {
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

    void it('指定した ID の要素が存在する場合は例外を投げない', () => {
        __safeGetElementById(theElementId);
    });

    void it('指定した ID の要素が存在しない場合は AssertionError を投げる', () => {
        assert.throws(() => {
            __safeGetElementById(`__${theElementId}`);
        }, AssertionError);
    });
});
