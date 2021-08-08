import { Edge } from "./edge";
import { Rect } from "./util";

export class Cell {
  top: Edge;
  left: Edge;
  right: Edge;
  bottom: Edge;
  isEmpty: boolean = false;
  sprite?: HTMLDivElement;

  constructor(top: Edge, left: Edge, right: Edge, bottom: Edge) {
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
  }

  get topLeft() {
    return this.top.from;
  }

  get topRight() {
    return this.top.to;
  }

  get bottomLeft() {
    return this.bottom.from;
  }

  get bottomRight() {
    return this.bottom.to;
  }

  get bounds(): Rect {
    const { topLeft, bottomRight, topRight } = this;
    return [
      topLeft.x,
      topLeft.y,
      topRight.x - topLeft.x,
      bottomRight.y - topRight.y,
    ];
  }

  cut() {
    this.isEmpty = true;
  }
}
