import { EventEmitter } from 'eventemitter3';
import { Action, Direction } from '.';
import { AdjacentCell, Cell, Grid } from './grid';

export class GridProxy extends EventEmitter {
  grid: Grid;
  cell: Cell;
  direction: Direction = Direction.Stationary;
  lastDirection: Direction = Direction.Stationary;
  action?: Action;

  constructor(grid: Grid) {
    super();
    this.grid = grid;
    this.cell = grid.cells[0][0];
  }

  setCell(cell: Cell, direction: Direction) {
    this.cell = cell;
    this.direction = direction;
  }

  faceLeft() {
    this.direction = Direction.Left;
  }

  faceRight() {
    this.direction = Direction.Right;
  }

  faceUp() {
    this.direction = Direction.Up;
  }

  faceDown() {
    this.direction = Direction.Down;
  }

  update() {
    const { direction: lastDirection } = this;

    this.processInput();
    if (this.moveToNextCell()) {
      this.checkForCollision();
      this.checkForCut();
    }

    if (this.direction !== lastDirection) {
      this.lastDirection = lastDirection;
    }
  }

  processInput() {
    const { action, direction } = this;
    if (action !== undefined) {
      action === Action.Left &&
        direction !== Direction.Right &&
        this.faceLeft();
      action === Action.Right &&
        direction !== Direction.Left &&
        this.faceRight();
      action === Action.Up && direction !== Direction.Down && this.faceUp();
      action === Action.Down && direction !== Direction.Up && this.faceDown();
    }
  }

  moveToNextCell() {
    const { direction, cell } = this;
    if (direction !== Direction.Stationary) {
      let didMoveToNewCell = false;
      didMoveToNewCell =
        didMoveToNewCell ||
        this.moveToAdjacentCell(
          Direction.Down,
          AdjacentCell.South,
          cell.isBottomEdge,
        );
      didMoveToNewCell =
        didMoveToNewCell ||
        this.moveToAdjacentCell(
          Direction.Up,
          AdjacentCell.North,
          cell.isTopEdge,
        );
      didMoveToNewCell =
        didMoveToNewCell ||
        this.moveToAdjacentCell(
          Direction.Left,
          AdjacentCell.West,
          cell.isLeftEdge,
        );
      didMoveToNewCell =
        didMoveToNewCell ||
        this.moveToAdjacentCell(
          Direction.Right,
          AdjacentCell.East,
          cell.isRightEdge,
        );
      return didMoveToNewCell;
    }
    return false;
  }

  moveToAdjacentCell(
    checkDirection: Direction,
    adjacentKey: AdjacentCell,
    isEdge: boolean,
  ) {
    const { direction, cell, grid } = this;
    if (direction === checkDirection) {
      if (isEdge) {
        this.setCell(cell, Direction.Stationary);
      } else {
        const prevCell = cell;
        grid.breakCell(prevCell);
        this.setCell(cell[adjacentKey], direction);
        return true;
      }
    }
    return false;
  }

  checkForCut() {
    const { direction, lastDirection, cell, grid } = this;
    const nextCell = cell.getNextCell(direction);
    if (nextCell && nextCell.isEmpty) {
      console.log('cut!', nextCell.h, nextCell.v);
      grid.floodFill(cell, direction, lastDirection);
    }
  }

  checkForCollision() {
    const { cell } = this;
    if (cell.isEmpty) {
      console.log('collision!', cell.h, cell.v);
    }
  }
}
