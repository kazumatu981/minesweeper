export function __assertIsString(x) {
    if (typeof x !== 'string') {
        throw new Error(`Expected a string, but got ${typeof x}`);
    }
}

export function __assertIsNumber(x) {
    if (typeof x !== 'number') {
        throw new Error(`Expected a number, but got ${typeof x}`);
    }
}

export function __assertIsFunction(x) {
    if (typeof x !== 'function') {
        throw new Error(`Expected a function, but got ${typeof x}`);
    }
}

export function __assertIsIncludedIn(value, array) {
    if (!array.includes(value)) {
        throw new Error(`The value ${value} is not included in the array`);
    }
}

export function __assertBetween(value, minimum, maximum) {
    if (value < minimum || maximum < value) {
        throw new Error(
            `The value ${value} is not between ${minimum} and ${maximum}`
        );
    }
}

export function __safeGetElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}
