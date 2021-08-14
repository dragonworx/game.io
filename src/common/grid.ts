export class Grid {
  cells: Cell[][];
  size: number;
  divisions: number;
  cellSize: number;
  margin: number;
  cellMap: Map<string, Cell>;
  outerBounds: Bounds;
  innerBounds: Bounds;

  constructor(size: number, divisions: number, margin: number) {
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

  forEach(fn: CellIterator) {
    const { divisions, cellSize } = this;
    for (let v = 0; v < divisions; v += 1) {
      for (let h = 0; h < divisions; h += 1) {
        const cell = this.cells[v][h];
        fn(cell);
      }
    }
  }
}

export type CellIterator = (cell: Cell) => void;

export const cellKey = (h: number, v: number) => `${h}:${v}`;

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

  get position() {
    return this.bounds.position;
  }

  get center() {
    let { centerX: x, centerY: y } = this.bounds;
    return [x, y];
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
