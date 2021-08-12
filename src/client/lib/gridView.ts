import { Cell } from '../../core/cell';
import { Grid } from '../../core/grid';
import { Graphics, PIXI } from './graphics';

const degToRad = (deg: number) => deg * (Math.PI / 180);
const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const IntroAnimationDurationMs = 2000;

export class GridView {
  grid: Grid;
  graphics: Graphics;
  gridMargin: number;
  cellSpriteMap: Map<Cell, PIXI.Sprite>;

  constructor(grid: Grid, graphics: Graphics, gridMargin: number) {
    this.grid = grid;
    this.graphics = graphics;
    this.gridMargin = gridMargin;

    this.cellSpriteMap = new Map();

    this.createGridCells();
  }

  async createGridCells() {
    const { grid, gridMargin, graphics, cellSpriteMap } = this;
    const texture = await this.graphics.loadTexture('cell', 'cell.png');
    grid.forEach((cell: Cell, h: number, v: number, x: number, y: number) => {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.x = gridMargin + x + grid.cellWidth / 2;
      sprite.y = gridMargin + y + grid.cellHeight / 2;
      sprite.width = 0;
      sprite.height = 0;
      sprite.alpha = 0;
      graphics.addObject(sprite);
      cellSpriteMap.set(cell, sprite);
      graphics.ease(
        sprite,
        {
          width: grid.cellWidth,
          height: grid.cellHeight,
          alpha: 1,
        },
        Math.round(Math.random() * IntroAnimationDurationMs),
        'easeOutBack',
      );
    });
    setTimeout(
      () => document.querySelector('#main header')?.classList.add('expanded'),
      IntroAnimationDurationMs / 3,
    );
  }
}
