export interface Coordinate {
    x: number;
    y: number;
}

export function getNeighbor(center: Coordinate, size: number): Coordinate[] {
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
