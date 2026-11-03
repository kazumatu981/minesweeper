import { type Coordinate } from './coordinate.js';

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

function isCoordinateEqual(v1: Coordinate, v2: Coordinate): boolean {
    return v1.x === v2.x && v1.y === v2.y;
}
export function createRandomCoordinates(
    size: number,
    count: number
): Coordinate[] {
    return Array.from({ length: count }).reduce<Coordinate[]>((prev) => {
        const v1: Coordinate = { x: 0, y: 0 };
        do {
            v1.x = createRandom(0, size - 1);
            v1.y = createRandom(0, size - 1);
        } while (prev.some((v2) => isCoordinateEqual(v1, v2)));
        prev.push(v1);
        return prev;
    }, []);
}
