import { EventEmitter } from 'eventemitter3';
import { InitialPlayerSpeed, PlayerPositionInfo } from '.';
import { Cell, Grid, Point } from './grid';

export class GridProxy extends EventEmitter {
  grid: Grid;
  cell?: Cell;
  vector: Point = [0, 0];
  position: Point = [-1, -1];
  offset: number = 0;
  speed: number = InitialPlayerSpeed;

  constructor(grid: Grid) {
    super();
    this.grid = grid;
  }

  setPosition(info: PlayerPositionInfo): Point {
    const { h, v, vx, vy, o } = info;
    const { position, vector, grid, offset } = this;
    const [prevX, prevY] = position;

    const cell = grid.getCell(h, v);
    const { bounds } = cell;
    vector[0] = vx;
    vector[1] = vy;
    let x = bounds.centerX;
    let y = bounds.centerY;
    this.offset = o;

    if (vx === -1) x -= offset;
    if (vx === 1) x += offset;
    if (vy === -1) y -= offset;
    if (vy === 1) y += offset;

    position[0] = x;
    position[1] = y;

    return [prevX, prevY];
  }

  update() {
    this.offset += this.speed;
  }
}
