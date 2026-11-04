import { __assertBetween } from './assert.js';

/**
 * 座標
 */
export interface Coordinate {
    x: number;
    y: number;
}

/**
 * 対象座標が矩形の範囲内にあることを確認する
 * @param coordinate 検査対象座標
 * @param size 矩形サイズ
 */
export function __assertCoordinateInRange(
    coordinate: Coordinate,
    size: number
): void {
    __assertBetween(coordinate.x, 0, size - 1);
    __assertBetween(coordinate.y, 0, size - 1);
}

/**
 * 中心座標の周辺座標を取得する
 * @param center 中心の座標
 * @param size 矩形サイズ
 * @returns 中心座標の周辺
 */
export function getNeighbor(center: Coordinate, size: number): Coordinate[] {
    __assertCoordinateInRange(center, size);
    return [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    ]
        .map((shift) => {
            return {
                x: center.x + shift.x,
                y: center.y + shift.y,
            };
        })
        .filter((item) => {
            return (
                0 <= item.x &&
                item.x <= size - 1 &&
                0 <= item.y &&
                item.y <= size - 1
            );
        });
}

/**
 * 座標が同じかどうかを確認する
 * @param v1 比較対象1の座標
 * @param v2 比較対象2の座標
 * @returns 座標が同じ場合はtrue、それ以外はfalse
 */
export function isCoordinateEqual(v1: Coordinate, v2: Coordinate): boolean {
    return v1.x === v2.x && v1.y === v2.y;
}
