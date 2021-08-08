import { Edge } from './edge';

export class Vertex {
  x: number;
  y: number;
  above?: Edge;
  below?: Edge;
  prev?: Edge;
  next?: Edge;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get hasVerticalCuts() {
    return (this.above && this.above.isCut) || (this.below && this.below.isCut);
  }

  get hasBothVerticalCuts() {
    return this.above && this.below && this.above.isCut && this.below.isCut;
  }

  get hasHorizontalCuts() {
    return (this.prev && this.prev.isCut) || (this.next && this.next.isCut);
  }

  get hasBothHorizontalCuts() {
    return this.prev && this.next && this.prev.isCut && this.next.isCut;
  }
}
