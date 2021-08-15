import { EventEmitter } from 'eventemitter3';
import { Direction } from '.';

export class Grid extends EventEmitter {
  cells: Cell[][];
  size: number;
  divisions: number;
  cellSize: number;
  margin: number;
  cellMap: Map<string, Cell>;
  outerBounds: Bounds;
  innerBounds: Bounds;

  constructor(size: number, divisions: number, margin: number) {
    super();
    this.size = size;
    this.divisions = divisions;
    this.margin = margin;
    const cellSize = (this.cellSize = Math.round(size / divisions));
    this.outerBounds = new Bounds(0, 0, size + margin * 2, size + margin * 2);
    this.innerBounds = new Bounds(margin, margin, size, size);
    const cellMap = (this.cellMap = new Map());
    const cells: Cell[][] = (this.cells = []);
    for (let v = 1; v <= divisions; v++) {
      const row: Cell[] = [];
      for (let h = 1; h <= divisions; h++) {
        const left = margin + (h - 1) * this.cellSize;
        const top = margin + (v - 1) * this.cellSize;
        const cell = new Cell(
          this,
          h,
          v,
          new Bounds(left, top, cellSize, cellSize),
        );
        const key = cellKey(h, v);
        cellMap.set(key, cell);
        row.push(cell);
      }
      cells.push(row);
    }
  }

  getCell(h: number, v: number) {
    const { divisions, cellMap } = this;
    let hIndex = h;
    let vIndex = v;
    if (hIndex < 1) hIndex += divisions;
    if (hIndex > divisions) hIndex = hIndex - divisions;
    if (vIndex < 1) vIndex += divisions;
    if (vIndex > divisions) vIndex = vIndex - divisions;
    const key = cellKey(hIndex, vIndex);
    return cellMap.get(key)!;
  }

  breakCell(cell: Cell) {
    cell.isEmpty = true;
    this.emit('breakcell', cell);
  }

  forEach(fn: CellIterator) {
    const { divisions } = this;
    for (let v = 0; v < divisions; v += 1) {
      for (let h = 0; h < divisions; h += 1) {
        const cell = this.cells[v][h];
        fn(cell);
      }
    }
  }

  floodFill(cell: Cell, direction: Direction, lastDirection: Direction) {
    console.log('floodfill!', cell.h, cell.v, direction, lastDirection);
    this.breakCell(cell);
    const seedCell = cell.getFloodSeedCell(direction, lastDirection)!;
    this.floodFillRecursive(seedCell);
  }

  floodFillRecursive(cell: Cell) {
    if (cell.isEdge || cell.isEmpty) {
      return;
    }
    if (!cell.isEmpty) {
      this.breakCell(cell);
      this.floodFillRecursive(cell.north);
      this.floodFillRecursive(cell.south);
      this.floodFillRecursive(cell.east);
      this.floodFillRecursive(cell.west);
    }
  }
}

export type CellIterator = (cell: Cell) => void;

export const cellKey = (h: number, v: number) => `${h}:${v}`;

export enum AdjacentCell {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
}

export class Cell {
  grid: Grid;
  h: number;
  v: number;
  bounds: Bounds;
  isEmpty: boolean = false;

  constructor(grid: Grid, h: number, v: number, bounds: Bounds) {
    this.grid = grid;
    this.h = h;
    this.v = v;
    this.bounds = bounds;
  }

  get north() {
    return this.grid.getCell(this.h, this.v - 1);
  }

  get south() {
    return this.grid.getCell(this.h, this.v + 1);
  }

  get east() {
    return this.grid.getCell(this.h + 1, this.v);
  }

  get west() {
    return this.grid.getCell(this.h - 1, this.v);
  }

  get isLeftEdge() {
    return this.h === 1;
  }

  get isRightEdge() {
    return this.h === this.grid.divisions;
  }

  get isTopEdge() {
    return this.v === 1;
  }

  get isBottomEdge() {
    return this.v === this.grid.divisions;
  }

  get isEdge() {
    return (
      this.isLeftEdge || this.isRightEdge || this.isTopEdge || this.isBottomEdge
    );
  }

  get position() {
    return this.bounds.position;
  }

  get center() {
    let { centerX: x, centerY: y } = this.bounds;
    return [x, y];
  }

  getNextCell(direction: Direction) {
    if (direction === Direction.Up) {
      if (!this.isTopEdge) return this.north;
    } else if (direction === Direction.Down) {
      if (!this.isBottomEdge) return this.south;
    } else if (direction === Direction.Left) {
      if (!this.isLeftEdge) return this.west;
    } else if (direction === Direction.Right) {
      if (!this.isRightEdge) return this.east;
    }
    return null;
  }

  getFloodSeedCell(direction: Direction, lastDirection: Direction) {
    if (direction === Direction.Left) {
      return lastDirection === Direction.Up ? this.south : this.north;
    } else if (direction === Direction.Right) {
      return lastDirection === Direction.Up ? this.south : this.north;
    } else if (direction === Direction.Up) {
      return lastDirection === Direction.Left ? this.east : this.west;
    } else if (direction === Direction.Down) {
      return lastDirection === Direction.Left ? this.east : this.west;
    }
  }
}

export type Point = [number, number];

export class Bounds {
  constructor(
    readonly left: number,
    readonly top: number,
    readonly width: number,
    readonly height: number,
  ) {}

  get right() {
    return this.left + this.width;
  }

  get bottom() {
    return this.top + this.height;
  }

  get center(): Point {
    return [this.centerX, this.centerY];
  }

  get position(): Point {
    return [this.left, this.top];
  }

  get centerX() {
    return this.left + this.width / 2;
  }

  get centerY() {
    return this.top + this.height / 2;
  }
}
