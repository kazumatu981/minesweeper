import { type Coordinate, isCoordinateEqual } from './coordinate.js';

/**
 * 指定範囲内から、previous に含まれない整数をランダムに生成します。
 * @param minimum 生成する整数の最小値（含む）
 * @param maximum 生成する整数の最大値（含む）
 * @param previous 除外する整数の一覧
 * @returns 生成した整数
 */
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

/**
 * size × size の範囲から、重複しない座標をランダムに生成します。
 * @param size 座標範囲の一辺のサイズ
 * @param count 生成する座標の数
 * @returns 生成した座標の配列
 */
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
