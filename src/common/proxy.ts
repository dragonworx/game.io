import { EventEmitter } from 'eventemitter3';
import { Action, Direction } from '.';
import { Cell, Grid } from './grid';

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

  setCell(cell: Cell, direction: Direction = this.direction) {
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
    this.handleInput();
    this.moveToNextCell();
  }

  handleInput() {
    const { action, direction } = this;
    if (action !== undefined) {
      this.lastDirection = direction;
      action === Action.Left && this.faceLeft();
      action === Action.Right && this.faceRight();
      action === Action.Up && this.faceUp();
      action === Action.Down && this.faceDown();
    }
  }

  moveToNextCell() {
    const { direction, cell } = this;
    if (direction === Direction.Down) {
      this.setCell(cell.south);
    } else if (direction === Direction.Up) {
      this.setCell(cell.north);
    } else if (direction === Direction.Left) {
      this.setCell(cell.west);
    } else if (direction === Direction.Right) {
      this.setCell(cell.east);
    }
  }
}
