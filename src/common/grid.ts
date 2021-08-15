import { EventEmitter } from 'eventemitter3';
import { Direction, isHorizontal, isVertical } from '.';

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

  init() {
    this.forEach((cell: Cell) => {
      cell.isEmpty = false;
    });
  }

  getCell(h: number, v: number): Cell | null {
    const { divisions, cellMap } = this;
    let hIndex = h;
    let vIndex = v;
    if (hIndex < 1) return null;
    if (hIndex > divisions) return null;
    if (vIndex < 1) return null;
    if (vIndex > divisions) return null;
    const key = cellKey(hIndex, vIndex);
    return cellMap.get(key)!;
  }

  breakCell(clientId: string, cell: Cell) {
    cell.isEmpty = true;
    this.emit('breakcell', clientId, cell);
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

  checkForCut(
    clientId: string,
    currentCell: Cell,
    direction: Direction,
    lastDirection: Direction,
  ) {
    if (isVertical(direction)) {
      lastDirection === Direction.Right &&
        this.checkForCutWithCell(
          clientId,
          currentCell,
          currentCell.west,
          direction,
          lastDirection,
        );
      this.checkForCutWithCell(
        clientId,
        currentCell,
        currentCell,
        direction,
        lastDirection,
      );
      lastDirection === Direction.Left &&
        this.checkForCutWithCell(
          clientId,
          currentCell,
          currentCell.east,
          direction,
          lastDirection,
        );
    } else if (isHorizontal(direction)) {
      lastDirection === Direction.Down &&
        this.checkForCutWithCell(
          clientId,
          currentCell,
          currentCell.north,
          direction,
          lastDirection,
        );
      this.checkForCutWithCell(
        clientId,
        currentCell,
        currentCell,
        direction,
        lastDirection,
      );
      lastDirection === Direction.Up &&
        this.checkForCutWithCell(
          clientId,
          currentCell,
          currentCell.south,
          direction,
          lastDirection,
        );
    }
  }

  checkForCutWithCell(
    clientId: string,
    currentCell: Cell,
    checkCell: Cell | null,
    direction: Direction,
    lastDirection: Direction,
  ) {
    if (checkCell === null) {
      return;
    }
    const nextCell = checkCell.getNextCell(direction);
    if (nextCell && nextCell.isEmpty) {
      const cells = this.floodFill(
        clientId,
        currentCell,
        direction,
        lastDirection,
      );
      const edges = cells.filter(cell => cell.isEdge);
      if (edges.length) {
        // hack to stop unknown flood fill bug due to edge case direction combinations
        cells.forEach(cell => (cell.isEmpty = false));
      } else {
        cells.forEach(cell => this.breakCell(clientId, cell));
      }
    }
  }

  floodFill(
    clientId: string,
    cell: Cell,
    direction: Direction,
    lastDirection: Direction,
  ) {
    const seedCell = cell.getFloodSeedCell(direction, lastDirection)!;
    const cells: Cell[] = [];
    this.breakCell(clientId, cell);
    this.floodFillRecursive(cells, seedCell);
    return cells;
  }

  floodFillRecursive(cells: Cell[], cell: Cell | null) {
    if (cell === null || cell.isEmpty) {
      return;
    }
    if (!cell.isEmpty) {
      // this.breakCell(cell);
      cell.isEmpty = true;
      cells.push(cell);
      this.floodFillRecursive(cells, cell.north);
      this.floodFillRecursive(cells, cell.south);
      this.floodFillRecursive(cells, cell.east);
      this.floodFillRecursive(cells, cell.west);
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
