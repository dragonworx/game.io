import { GridDivisions } from '../../common';
import { Grid, Cell } from '../../common/grid';
import { Graphics, PIXI } from './graphics';
import { ClientPlayer } from './player';

export const IntroAnimationDurationMs = 3000;

export class GridView {
  grid: Grid;
  graphics: Graphics;
  cellSpriteMap: Map<Cell, PIXI.Sprite>;
  container: PIXI.Container;
  players: ClientPlayer[] = [];

  constructor(grid: Grid, graphics: Graphics) {
    this.grid = grid;
    this.graphics = graphics;
    this.container = new PIXI.Container();
    graphics.addObject(this.container);

    this.cellSpriteMap = new Map();

    grid.on('breakcell', this.onBreakCell);
  }

  init(players: ClientPlayer[]) {
    const { grid, graphics, cellSpriteMap, container } = this;
    const { cellSize } = grid;
    const textureEnabled = graphics.textures.get('cell');
    const textureDisabled = graphics.textures.get('cell-disabled');
    grid.forEach((cell: Cell) => {
      const { h, v } = cell;
      let texture = textureEnabled;
      if (v === 1 || v === GridDivisions || h === 1 || h === GridDivisions) {
        texture = textureDisabled;
      }
      const sprite = new PIXI.Sprite(texture);
      const [x, y] = grid.getCell(h, v)!.position;
      const halfSize = grid.cellSize / 2;
      sprite.x = x + halfSize;
      sprite.y = y + halfSize;
      sprite.anchor.x = sprite.anchor.y = 0.5;
      sprite.width = 0;
      sprite.height = 0;
      sprite.alpha = 0;
      container.addChild(sprite);
      cellSpriteMap.set(cell, sprite);
      graphics
        .ease(
          sprite,
          {
            width: cellSize,
            height: cellSize,
            alpha: 0.5 + Math.random() * 0.5,
          },
          Math.round(Math.random() * IntroAnimationDurationMs),
          'easeOutCirc',
        )
        .on('complete', () => {
          (sprite.width = cellSize), (sprite.height = cellSize);
        });
    });
    this.players = players;
  }

  onBreakCell = (clientId: string, cell: Cell, wasCut: boolean) => {
    const { graphics, cellSpriteMap } = this;
    const sprite = cellSpriteMap.get(cell)!;
    const player = this.players.find(player => player.info.cid === clientId)!;
    sprite.tint = player.tint;
    setTimeout(
      () => {
        graphics.ease(
          sprite,
          {
            width: 0,
            height: 0,
          },
          2000,
          'easeOutBack',
        );
      },
      wasCut ? Math.round(Math.random() * 500) : 0,
    );
  };
}
