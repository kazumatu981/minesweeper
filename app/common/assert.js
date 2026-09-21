export class AssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AssertionError';
    }
}
/**
 * 値が文字列であることを確認する
 * @param {any} x テスト対象
 */
export function __assertIsString(x) {
    if (typeof x !== 'string') {
        throw new AssertionError(`Expected a string, but got ${typeof x}`);
    }
}

/**
 * 値がブール値であることを確認する
 * @param {any} x テスト対象
 */
export function __assertIsBoolean(x) {
    if (typeof x !== 'boolean') {
        throw new AssertionError(`Expected a boolean, but got ${typeof x}`);
    }
}

/**
 * 値が数値であることを確認する
 * @param {any} x テスト対象
 */
export function __assertIsNumber(x) {
    if (typeof x !== 'number') {
        throw new AssertionError(`Expected a number, but got ${typeof x}`);
    }
}

/**
 * 値が関数であることを確認する
 * @param {any} x テスト対象
 */
export function __assertIsFunction(x) {
    if (typeof x !== 'function') {
        throw new AssertionError(`Expected a function, but got ${typeof x}`);
    }
}

/**
 * 値が指定された範囲内にあることを確認する
 * @private
 * @param {number} value 値
 * @param {number} minimum 最小値
 * @param {number} maximum 最大値
 */
export function __assertBetween(value, minimum, maximum) {
    if (value < minimum || maximum < value) {
        throw new AssertionError(
            `The value ${value} is not between ${minimum} and ${maximum}`
        );
    }
}

/**
 * 配列のどれかになっているか
 * @param {any} value 対象の値
 * @param {any[]} array 値の範囲
 */
export function __assertSomeOf(value, array) {
    if (!array.includes(value)) {
        throw new AssertionError(`The value ${value} is not found on ${array}`);
    }
}
/**
 * IDからDOMエレメントを安全に取得する
 * 見つからなかった場合は、例外を発生させる
 * @private
 * @param {string} id エレメントID
 * @returns {HTMLElement} エレメント
 */
export function __safeGetElementById(id) {
    __assertIsString(id);

    const element = document.getElementById(id);
    if (!element) {
        throw new AssertionError(`Element with id "${id}" not found`);
    }
    return element;
}
