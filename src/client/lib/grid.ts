import { Vertex } from './vertex';
import { Edge } from './edge';
import { Cell } from './cell';
import { CutLine } from './cutLine';
import { edgeKey, vertexKey } from './util';

export class Grid {
  hDivisions: number;
  vDivisions: number;
  width: number = 0;
  height: number = 0;
  cellWidth: number = 0;
  cellHeight: number = 0;
  cells: Cell[][] = [];
  vertexMap: Map<string, Vertex> = new Map();
  edgeMap: Map<string, Edge> = new Map();
  totalCells: number = 0;

  constructor(
    width: number,
    height: number,
    hDivisions: number,
    vDivisions: number,
  ) {
    this.width = width;
    this.height = height;
    this.hDivisions = hDivisions;
    this.vDivisions = vDivisions;
    this.init();
  }

  get minCellSize() {
    return Math.min(this.cellWidth, this.cellHeight);
  }

  reset() {
    this.cells = [];
    this.init();
  }

  init() {
    const { hDivisions, vDivisions, vertexMap, edgeMap } = this;

    const cellWidth = (this.cellWidth = Math.floor(this.width / hDivisions));
    const cellHeight = (this.cellHeight = Math.floor(this.height / vDivisions));

    // create vertexes
    for (let v = 0; v <= vDivisions; v += 1) {
      const y = v * cellHeight;
      for (let h = 0; h <= hDivisions; h += 1) {
        const x = h * cellWidth;
        const vertex = new Vertex(x, y);
        const key = vertexKey(h, v);
        vertexMap.set(key, vertex);
      }
    }

    // create edges
    for (let v = 0; v < vDivisions; v += 1) {
      for (let h = 0; h < hDivisions; h += 1) {
        const topLeftVertexKey = vertexKey(h, v);
        const topRightVertexKey = vertexKey(h + 1, v);
        const bottomLeftVertexKey = vertexKey(h, v + 1);
        const topLeftVertex = vertexMap.get(topLeftVertexKey)!;
        const topRightVertex = vertexMap.get(topRightVertexKey)!;
        const bottomLeftVertex = vertexMap.get(bottomLeftVertexKey)!;
        const topEdge = new Edge(this, h, v, topLeftVertex, topRightVertex);
        const leftEdge = new Edge(this, h, v, topLeftVertex, bottomLeftVertex);
        const topEdgeKey = edgeKey(topLeftVertexKey, topRightVertexKey);
        const leftEdgeKey = edgeKey(topLeftVertexKey, bottomLeftVertexKey);
        edgeMap.set(topEdgeKey, topEdge);
        edgeMap.set(leftEdgeKey, leftEdge);

        if (v === vDivisions - 1) {
          const bottomRightVertexKey = vertexKey(h + 1, v + 1);
          const bottomRightVertex = vertexMap.get(bottomRightVertexKey)!;
          const bottomEdge = new Edge(
            this,
            h,
            v,
            bottomLeftVertex,
            bottomRightVertex,
          );
          const bottomEdgeKey = edgeKey(
            bottomLeftVertexKey,
            bottomRightVertexKey,
          );
          edgeMap.set(bottomEdgeKey, bottomEdge);
        }
      }

      const topRightVertexKey = vertexKey(hDivisions, v);
      const bottomRightVertexKey = vertexKey(hDivisions, v + 1);
      const topRightVertex = vertexMap.get(topRightVertexKey)!;
      const bottomRightVertex = vertexMap.get(bottomRightVertexKey)!;
      const rightEdge = new Edge(
        this,
        hDivisions,
        v,
        topRightVertex,
        bottomRightVertex,
      );
      const rightEdgeKey = edgeKey(topRightVertexKey, bottomRightVertexKey);
      edgeMap.set(rightEdgeKey, rightEdge);
    }

    // create cells
    this.totalCells = 0;
    for (let v = 0; v < vDivisions; v += 1) {
      const row: Cell[] = [];
      for (let h = 0; h < hDivisions; h += 1) {
        const topLeftVertexKey = vertexKey(h, v);
        const topRightVertexKey = vertexKey(h + 1, v);
        const bottomLeftVertexKey = vertexKey(h, v + 1);
        const bottomRightVertexKey = vertexKey(h + 1, v + 1);
        const topEdgeKey = edgeKey(topLeftVertexKey, topRightVertexKey);
        const leftEdgeKey = edgeKey(topLeftVertexKey, bottomLeftVertexKey);
        const rightEdgeKey = edgeKey(topRightVertexKey, bottomRightVertexKey);
        const bottomEdgeKey = edgeKey(
          bottomLeftVertexKey,
          bottomRightVertexKey,
        );
        const topEdge = edgeMap.get(topEdgeKey)!;
        const leftEdge = edgeMap.get(leftEdgeKey)!;
        const rightEdge = edgeMap.get(rightEdgeKey)!;
        const bottomEdge = edgeMap.get(bottomEdgeKey)!;
        const cell = new Cell(topEdge, leftEdge, rightEdge, bottomEdge);
        row.push(cell);

        this.totalCells++;

        if (h > 0) {
          // link horizontal edges prev/next
          topEdge.prev = edgeMap.get(
            edgeKey(vertexKey(h - 1, v), vertexKey(h, v)),
          );
          topEdge.prev!.next = topEdge;
          bottomEdge.prev = edgeMap.get(
            edgeKey(vertexKey(h - 1, v + 1), vertexKey(h, v + 1)),
          );
          bottomEdge.prev!.next = bottomEdge;
        }

        if (v > 0) {
          // link vertical edges above/below
          leftEdge.above = edgeMap.get(
            edgeKey(vertexKey(h, v - 1), vertexKey(h, v)),
          );
          leftEdge.above!.below = leftEdge;
          rightEdge.above = edgeMap.get(
            edgeKey(vertexKey(h + 1, v - 1), vertexKey(h + 1, v)),
          );
          rightEdge.above!.below = rightEdge;
        }

        // link vertex 4? edges
        this.linkVertexToQuadEdges(h, v);
        this.linkVertexToQuadEdges(h, v + 1);
      }

      this.linkVertexToQuadEdges(this.hDivisions, v);

      this.cells.push(row);
    }

    this.linkVertexToQuadEdges(this.hDivisions, this.vDivisions);
  }

  linkVertexToQuadEdges(h: number, v: number) {
    const { vertexMap, edgeMap } = this;
    const vertexCenterKey = vertexKey(h, v);
    const vertexAboveKey = vertexKey(h, v - 1);
    const vertexBelowKey = vertexKey(h, v + 1);
    const vertexPrevKey = vertexKey(h - 1, v);
    const vertexNextKey = vertexKey(h + 1, v);
    const vertex = vertexMap.get(vertexCenterKey)!;
    vertex.above = edgeMap.get(edgeKey(vertexAboveKey, vertexCenterKey));
    vertex.below = edgeMap.get(edgeKey(vertexCenterKey, vertexBelowKey));
    vertex.prev = edgeMap.get(edgeKey(vertexPrevKey, vertexCenterKey));
    vertex.next = edgeMap.get(edgeKey(vertexCenterKey, vertexNextKey));
  }

  getCell(h: number, v: number) {
    if (v >= this.cells.length || v < 0 || h < 0 || h >= this.hDivisions) {
      return;
    }
    return this.cells[v][h];
  }

  cutCells(cutLine: CutLine) {
    const { cellWidth, cellHeight } = this;
    const [x, y, w, h] = cutLine.getBounds();
    const gridHMin = x / cellWidth;
    const gridVMin = y / cellHeight;
    const gridHMax = gridHMin + w / cellWidth;
    const gridVMax = gridVMin + h / cellHeight;
    const vertexes: Set<Vertex> = new Set();
    cutLine.edges.forEach(edge => {
      vertexes.add(edge.from);
      vertexes.add(edge.to);
    });
    const emptyCells: Set<Cell> = new Set();
    let cell: Cell | undefined;
    for (let v = gridVMin; v < gridVMax; v++) {
      let isEmpty = false;
      for (let h = gridHMin; h < gridHMax; h++) {
        cell = this.getCell(h, v);
        if (cell) {
          if (
            vertexes.has(cell.left.from) &&
            vertexes.has(cell.left.to) &&
            cell.left.isCut
          ) {
            isEmpty = !isEmpty;
          }
          if (isEmpty) {
            emptyCells.add(cell);
          }
        }
      }
      if (
        isEmpty &&
        (!vertexes.has(cell!.right.from) || !vertexes.has(cell!.right.to)) &&
        !cell!.right.isCut
      ) {
        for (let h = gridHMax; h >= gridHMin; h--) {
          cell = this.getCell(h, v);
          if (cell) {
            emptyCells.delete(cell);
          }
        }
      }
    }
    emptyCells.forEach(cell => {
      cell.cut();
    });
    cutLine.uncutEdges();
    return emptyCells;
  }
}
