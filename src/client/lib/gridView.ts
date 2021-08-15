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

    grid.on('breakcell', this.onBreakCell);
  }

  init() {
    const { grid, graphics, cellSpriteMap } = this;
    const { cellSize } = grid;
    const texture = graphics.textures.get('cell');
    grid.forEach((cell: Cell) => {
      const { h, v } = cell;
      const sprite = new PIXI.Sprite(texture);
      const [x, y] = grid.getCell(h, v)!.position;
      const halfSize = grid.cellSize / 2;
      sprite.x = x + halfSize;
      sprite.y = y + halfSize;
      sprite.anchor.x = sprite.anchor.y = 0.5;
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
          'easeOutCirc',
        )
        .on('complete', () => {
          (sprite.width = cellSize), (sprite.height = cellSize);
          sprite.alpha = 1;
        });
    });
  }

  onBreakCell = (_clientId: string, cell: Cell) => {
    const { graphics, cellSpriteMap } = this;
    const sprite = cellSpriteMap.get(cell)!;
    graphics.ease(
      sprite,
      {
        width: 0,
        height: 0,
      },
      2000,
      'easeOutBack',
    );
  };
}
