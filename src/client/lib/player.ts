import { Direction, PlayerInfo, PlayerPositionInfo } from '../../common';
import { Cell, Grid } from '../../common/grid';
import { degToRad, Graphics, PIXI } from './graphics';
import { GridView } from './gridView';
import { ClientIO } from './io';

export class ClientPlayer {
  grid: Grid;
  io: ClientIO;
  info: PlayerInfo;
  graphics: Graphics;
  gridView: GridView;
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  label: PIXI.Text;
  hasAddedToStage: boolean = false;
  direction: Direction = Direction.Stationary;
  cell: Cell;

  constructor(
    grid: Grid,
    io: ClientIO,
    info: PlayerInfo,
    graphics: Graphics,
    gridView: GridView,
  ) {
    this.grid = grid;
    this.io = io;
    this.info = info;
    this.graphics = graphics;
    this.gridView = gridView;
    this.cell = grid.cells[0][0];

    const container = (this.container = new PIXI.Container());
    const label = (this.label = new PIXI.Text(info.n, {
      fontFamily: 'Orbitron',
      fontSize: 14,
      fill: '#ffffff',
      stroke: '#000000',
    }));

    const texture = graphics.textures.get('blade');
    const sprite = (this.sprite = new PIXI.Sprite(texture));
    sprite.width = sprite.height = 20;
    sprite.anchor.x = sprite.anchor.y = 0.5;
    label.anchor.x = label.anchor.y = 0.5;
    container.addChild(sprite, label);
    graphics.addTicker(this.onUpdate);
  }

  get position() {
    const { container } = this;
    return [container.x, container.y];
  }

  setInitialPosition(info: PlayerPositionInfo) {
    const { hasAddedToStage, graphics, container, grid } = this;
    const { h, v, d } = info;
    const cell = grid.getCell(h, v);
    const [x, y] = cell.center;
    this.cell = cell;
    this.direction = d;
    const prevX = container.x;
    const prevY = container.y;

    this.setLabelPosition();

    if (!hasAddedToStage) {
      graphics.addObject(container);
      this.hasAddedToStage = true;
    }

    if (prevX === 0 && prevY === 0) {
      container.x = x;
      container.y = y;
    } else {
      graphics.ease(
        container,
        {
          x,
          y,
        },
        1000,
        'easeOutBack',
      );
    }
  }

  updateFromState(info: PlayerPositionInfo, fps: number) {
    const { container, grid, gridView } = this;
    const { h, v, d } = info;
    gridView.breakCell(this.cell);
    const cell = (this.cell = grid.getCell(h, v));
    if (cell.isEmpty) {
      console.log('!');
    }
    const [x, y] = cell.center;
    this.direction = d;
    container.x = x;
    container.y = y;
  }

  setLabelPosition() {
    const { label, direction } = this;
    if (direction === Direction.Down) {
      label.x = 0;
      label.y = 25;
    } else if (direction === Direction.Right) {
      label.x = 50;
      label.y = 0;
    } else if (direction === Direction.Up) {
      label.x = 0;
      label.y = -30;
    } else if (direction === Direction.Left) {
      label.x = -50;
      label.y = 0;
    }
  }

  gameInit() {}

  gameStart() {
    this.label.visible = false;
  }

  dispose() {
    this.graphics.removeObject(this.container);
  }

  onUpdate = () => {
    // this is mainly for graphics updates, server has authoritive updates
    this.sprite.rotation += degToRad(1);
  };
}
