function _format(
    prefix: string,
    suffix: string | undefined,
    separator: string,
    ...args: (string | number)[]
) {
    const body = [...args].map((arg) => arg.toString()).join(separator);
    return [prefix, body, suffix]
        .filter((s) => s !== undefined)
        .join(separator);
}

export function formatId(
    prefix: string,
    suffix: string | undefined,
    ...args: (string | number)[]
) {
    return _format(prefix, suffix, '-', ...args);
}

export function formatClass(
    prefix: string,
    suffix: string | undefined,
    ...args: (string | number)[]
) {
    return _format(prefix, suffix, '_', ...args);
}
