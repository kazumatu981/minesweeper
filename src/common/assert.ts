export class AssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = AssertionError.name;
    }
}

/**
 * 値が指定された範囲内にあることを確認する
 * @private
 * @param value 値
 * @param minimum 最小値
 * @param maximum 最大値
 */
export function __assertBetween(
    value: number,
    minimum: number,
    maximum: number
): void {
    if (value < minimum || maximum < value) {
        throw new AssertionError(
            `The value ${value} is not between ${minimum} and ${maximum}`
        );
    }
}

/**
 * 配列のどれかになっているか
 * @param value 対象の値
 * @param array 値の範囲
 */
export function __assertSomeOf<T>(value: T, array: T[]): void {
    if (!array.includes(value)) {
        throw new AssertionError(`The value ${value} is not found on ${array}`);
    }
}
/**
 * IDからDOMエレメントを安全に取得する
 * 見つからなかった場合は、例外を発生させる
 * @private
 * @param id エレメントID
 * @returns エレメント
 */
export function __safeGetElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
        throw new AssertionError(`Element with id "${id}" not found`);
    }
    return element;
}
