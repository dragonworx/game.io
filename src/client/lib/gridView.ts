import { Grid, Cell } from '../../common/grid';
import { Graphics, PIXI } from './graphics';

const degToRad = (deg: number) => deg * (Math.PI / 180);

const IntroAnimationDurationMs = 3000;

export class GridView {
  grid: Grid;
  graphics: Graphics;
  cellSpriteMap: Map<Cell, PIXI.Sprite>;

  constructor(grid: Grid, graphics: Graphics) {
    this.grid = grid;
    this.graphics = graphics;

    this.cellSpriteMap = new Map();
  }

  init() {
    const { grid, graphics, cellSpriteMap } = this;
    const { cellSize } = grid;
    const texture = graphics.textures.get('cell');
    grid.forEach((cell: Cell) => {
      const { h, v } = cell;
      const sprite = new PIXI.Sprite(texture);
      const [x, y] = grid.getCell(h, v).position;
      sprite.x = x;
      sprite.y = y;
      sprite.width = 0;
      sprite.height = 0;
      sprite.alpha = 0;
      graphics.addObject(sprite);
      cellSpriteMap.set(cell, sprite);
      graphics
        .ease(
          sprite,
          {
            width: cellSize,
            height: cellSize,
            alpha: 1,
          },
          Math.round(Math.random() * IntroAnimationDurationMs),
          'easeOutQuart',
        )
        .on('complete', () => {
          (sprite.width = cellSize), (sprite.height = cellSize);
          sprite.alpha = 1;
        });
    });
  }
}
