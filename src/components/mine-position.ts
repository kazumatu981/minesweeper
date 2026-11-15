import {
    createRandomCoordinates,
    getNeighbor,
    type Coordinate,
} from '../common/index.js';

export interface MinePosition {
    rowId: number;
    colId: number;
}

export interface MinesOption {
    size: number;
    bombCount?: number | undefined;
    bombs?: MinePosition[] | undefined;
}

function coordinateToPosition(coordinate: Coordinate): MinePosition {
    return {
        rowId: coordinate.x,
        colId: coordinate.y,
    };
}

function positionToCoordinate(position: MinePosition): Coordinate {
    return {
        x: position.rowId,
        y: position.colId,
    };
}

export function safeGetBomPositions(minesOption: MinesOption): MinePosition[] {
    return (
        minesOption.bombs ??
        createRandomCoordinates(minesOption.size, minesOption.bombCount!).map(
            coordinateToPosition
        )
    );
}

export function getNeighborPositions(
    position: MinePosition,
    size: number
): MinePosition[] {
    return getNeighbor(positionToCoordinate(position), size).map(
        coordinateToPosition
    );
}
