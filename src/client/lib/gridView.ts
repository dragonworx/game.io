import { Cell } from '../../core/cell';
import { Grid } from '../../core/grid';
import { Graphics, PIXI } from './graphics';

const degToRad = (deg: number) => deg * (Math.PI / 180);
const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const IntroAnimationDurationMs = 5000;

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
  }

  get center(): [number, number] {
    return [
      this.gridMargin + this.grid.width / 2,
      this.gridMargin + this.grid.height / 2,
    ];
  }

  init() {
    const { grid, gridMargin, graphics, cellSpriteMap } = this;
    const texture = graphics.textures.get('cell');
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
      graphics
        .ease(
          sprite,
          {
            width: grid.cellWidth,
            height: grid.cellHeight,
            alpha: 1,
          },
          Math.round(Math.random() * IntroAnimationDurationMs),
          'easeOutBack',
        )
        .on('complete', () => {
          (sprite.width = grid.cellWidth), (sprite.height = grid.cellHeight);
          sprite.alpha = 1;
        });
    });
  }

  getPosition(h: number, v: number): [number, number] {
    const { gridMargin, grid } = this;
    const { cellWidth, cellHeight } = grid;
    return [gridMargin + cellWidth * h, gridMargin + cellHeight * v];
  }
}
