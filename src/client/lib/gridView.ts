import * as PIXI from 'pixi.js';
import { Ease, ease } from 'pixi-ease';
import { Cell } from '../../core/cell';
import { Grid } from '../../core/grid';

const degToRad = (deg: number) => deg * (Math.PI / 180);
const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GridView {
  pixi: PIXI.Application;
  grid: Grid;
  gridMargin: number;
  cellSpriteMap: Map<Cell, PIXI.Sprite>;

  constructor(grid: Grid, gridMargin: number) {
    this.grid = grid;
    this.gridMargin = gridMargin;
    const size = grid.width + gridMargin * 2;
    const pixi = (this.pixi = new PIXI.Application({
      width: size,
      height: size,
      backgroundColor: 0xffffff,
    }));

    document.getElementById('canvas')!.appendChild(pixi.view);

    const cellSpriteMap = (this.cellSpriteMap = new Map());

    pixi.loader.add('cell', 'cell.png').load((loader, resources) => {
      grid.forEach((cell: Cell, h: number, v: number, x: number, y: number) => {
        const sprite = new PIXI.Sprite(resources['cell'].texture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = gridMargin + x + grid.cellWidth / 2;
        sprite.y = gridMargin + y + grid.cellHeight / 2;
        sprite.width = 0;
        sprite.height = 0;
        sprite.alpha = 0;
        pixi.stage.addChild(sprite);
        cellSpriteMap.set(cell, sprite);
        ease.add(
          sprite,
          {
            width: grid.cellWidth,
            height: grid.cellHeight,
            alpha: 1,
          },
          {
            duration: Math.round(Math.random() * 2500),
            ease: 'easeInOutBack',
          },
        );
      });
    });
  }
}
