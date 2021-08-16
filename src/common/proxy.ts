import { EventEmitter } from 'eventemitter3';
import { Action, BreakCellPoints, CollisionDamage, Direction } from '.';
import { AdjacentCell, Cell, Grid } from './grid';

export class GridProxy extends EventEmitter {
  clientId: string;
  grid: Grid;
  cell: Cell;
  direction: Direction = Direction.Stationary;
  lastDirection: Direction = Direction.Stationary;
  action?: Action;
  health: number = 100;
  score: number = 0;

  constructor(clientId: string, grid: Grid) {
    super();
    this.clientId = clientId;
    this.grid = grid;
    this.cell = grid.cells[0][0];
    grid.on('cut', this.onCut);
  }

  get isDead() {
    return this.health === 0;
  }

  init() {
    this.score = 0;
    this.health = 100;
    delete this.action;
  }

  setCell(cell: Cell | null, direction: Direction) {
    if (cell === null) {
      return;
    }
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
    const { direction: lastDirection, cell, grid } = this;

    this.processInput();
    if (this.moveToNextCell()) {
      grid.breakCell(this.clientId, cell);
      this.checkForCollision();
      this.checkForCut();
    } else {
      this.checkForCollision();
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
    const { direction, cell } = this;
    if (direction === checkDirection) {
      if (isEdge) {
        this.setCell(cell, Direction.Stationary);
      } else {
        this.setCell(cell[adjacentKey], direction);
        return true;
      }
    }
    return false;
  }

  checkForCut() {
    this.grid.checkForCut(
      this.clientId,
      this.cell,
      this.direction,
      this.lastDirection,
    );
  }

  checkForCollision() {
    const { cell } = this;
    if (cell.isEmpty) {
      console.log('collision!', cell.h, cell.v);
      this.health = Math.max(0, this.health - CollisionDamage);
      if (this.health === 0) {
        this.emit('dead', this);
      }
    }
  }

  onCut = (clientId: string, cellCount: number) => {
    if (clientId === this.clientId) {
      console.log('CUT!', clientId, cellCount);
      this.score += BreakCellPoints * cellCount;
    }
  };
}
