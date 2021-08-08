import { Edge } from './edge';
import { Rect } from './util';

export class CutLine {
  edges: Edge[] = [];

  clear() {
    this.edges = [];
  }

  addEdge(edge: Edge) {
    edge.isCut = true;
    this.edges.push(edge);
  }

  uncutEdges() {
    this.edges.forEach(edge => (edge.isCut = false));
  }

  getBounds(): Rect {
    let xMin: number = Number.MAX_VALUE;
    let yMin: number = Number.MAX_VALUE;
    let xMax: number = Number.MIN_VALUE;
    let yMax: number = Number.MIN_VALUE;
    this.edges.forEach(edge => {
      xMin = Math.min(xMin, edge.from.x);
      xMin = Math.min(xMin, edge.to.x);
      yMin = Math.min(yMin, edge.from.y);
      yMin = Math.min(yMin, edge.to.y);
      xMax = Math.max(xMax, edge.from.x);
      xMax = Math.max(xMax, edge.to.x);
      yMax = Math.max(yMax, edge.from.y);
      yMax = Math.max(yMax, edge.to.y);
    });

    return [xMin, yMin, xMax - xMin, yMax - yMin];
  }
}
