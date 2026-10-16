export function createRandom(
    minimum: number,
    maximum: number,
    previous: number[] = []
): number {
    let result: number;

    do {
        result = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    } while (previous.includes(result));

    return result;
}
