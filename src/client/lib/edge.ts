import { Grid } from './grid';
import { Vertex } from './vertex';
import { edgeKey, vertexKey } from './util';

export type Direction = -1 | 1;

export type Vector = [number, number];

export class Edge {
  grid: Grid;
  h: number;
  v: number;
  from: Vertex;
  to: Vertex;
  isCut: boolean = false;
  above?: Edge;
  below?: Edge;
  prev?: Edge;
  next?: Edge;

  constructor(grid: Grid, h: number, v: number, from: Vertex, to: Vertex) {
    this.grid = grid;
    this.h = h;
    this.v = v;
    this.from = from;
    this.to = to;
  }

  get isVertical() {
    return this.from.x === this.to.x;
  }

  get isHorizontal() {
    return this.from.y === this.to.y;
  }

  getPosition(direction: Direction, offset: number): Vector {
    if (this.isVertical) {
      if (direction === -1) {
        return [this.to.x, this.to.y - offset];
      } else {
        return [this.to.x, this.from.y + offset];
      }
    } else {
      if (direction === -1) {
        return [this.to.x - offset, this.from.y];
      } else {
        return [this.from.x + offset, this.from.y];
      }
    }
  }

  containsPosition(direction: Direction, offset: number): boolean {
    if (this.isVertical) {
      if (direction === -1) {
        return this.to.y - (this.to.y - offset) <= this.grid.cellHeight;
      } else {
        return this.from.y + offset - this.from.y <= this.grid.cellHeight;
      }
    } else {
      if (direction === -1) {
        return this.to.x - (this.to.x - offset) <= this.grid.cellWidth;
      } else {
        return this.from.x + offset - this.from.x <= this.grid.cellWidth;
      }
    }
  }

  getFromVertex(direction: Direction): Vertex {
    if (this.isVertical) {
      if (direction === -1) {
        return this.to;
      } else {
        return this.from;
      }
    } else {
      if (direction === -1) {
        return this.to;
      } else {
        return this.from;
      }
    }
  }

  getToVertex(direction: Direction): Vertex {
    if (this.isVertical) {
      if (direction === -1) {
        return this.from;
      } else {
        return this.to;
      }
    } else {
      if (direction === -1) {
        return this.from;
      } else {
        return this.to;
      }
    }
  }

  getNextEdge(direction: Direction) {
    if (this.isVertical) {
      if (direction === -1) {
        return this.above;
      } else {
        return this.below;
      }
    } else {
      if (direction === -1) {
        return this.prev;
      } else {
        return this.next;
      }
    }
  }

  getNextWrappedEdge(direction: Direction) {
    const edge = this.getNextEdge(direction);
    if (edge) {
      return edge;
    } else {
      if (this.isVertical) {
        if (direction === -1) {
          return this.grid.edgeMap.get(
            edgeKey(
              vertexKey(this.h, this.grid.hDivisions - 1),
              vertexKey(this.h, this.grid.hDivisions),
            ),
          )!;
        } else {
          return this.grid.edgeMap.get(
            edgeKey(vertexKey(this.h, 0), vertexKey(this.h, 1)),
          )!;
        }
      } else {
        if (direction === -1) {
          return this.grid.edgeMap.get(
            edgeKey(
              vertexKey(this.grid.hDivisions - 1, this.v),
              vertexKey(this.grid.hDivisions, this.v),
            ),
          )!;
        } else {
          return this.grid.edgeMap.get(
            edgeKey(vertexKey(0, this.v), vertexKey(1, this.v)),
          )!;
        }
      }
    }
  }

  getCell() {
    return this.grid.getCell(this.h, this.v);
  }

  getPrevCell() {
    return this.grid.getCell(this.h - 1, this.v);
  }

  getNextCell() {
    return this.grid.getCell(this.h + 1, this.v);
  }

  getAboveCell() {
    return this.grid.getCell(this.h, this.v - 1);
  }

  getBelowCell() {
    return this.grid.getCell(this.h, this.v + 1);
  }
}
