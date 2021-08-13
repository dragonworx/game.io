import { PlayerInfo, PlayerPositionInfo } from '../../common';
import { Cell, Point } from '../../common/grid';
import { Game } from './game';
import { degToRad, Graphics, PIXI } from './graphics';
import { IO } from './io';

export type Edge = 'top' | 'left' | 'bottom' | 'right';

export class Player {
  game: Game;
  io: IO;
  info: PlayerInfo;
  graphics: Graphics;
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  label: PIXI.Text;
  hasAddedToStage: boolean = false;
  position: Point = [-1, -1];
  cell?: Cell;
  vector: Point = [0, 0];

  constructor(game: Game, io: IO, info: PlayerInfo, graphics: Graphics) {
    this.game = game;
    this.io = io;
    this.info = info;
    this.graphics = graphics;
    this.container = new PIXI.Container();
    const container = new PIXI.Container();
    this.container.addChild(container);
    const label = (this.label = new PIXI.Text(info.name, {
      fontFamily: 'Orbitron',
      fontSize: 14,
      fill: '#ffffff',
      stroke: '#000000',
    }));
    // const mask = (this.mask = new PIXI.Graphics());
    // mask.beginFill(0xffffff);
    // mask.drawRect(0, 0, 30, 30);
    // mask.endFill();
    // this.container.addChild(mask);
    // this.container.mask = mask;

    const texture = graphics.textures.get('blade');
    const sprite = (this.sprite = new PIXI.Sprite(texture));
    sprite.width = sprite.height = 20;
    sprite.anchor.x = sprite.anchor.y = 0.5;
    label.anchor.x = label.anchor.y = 0.5;
    container.addChild(sprite, label);
    graphics.addTicker(this.onUpdate);
  }

  setInitialPosition(info: PlayerPositionInfo) {
    const { hasAddedToStage, graphics, container, game, position } = this;
    const { h, v, vectorX, vectorY } = info;
    if (!hasAddedToStage) {
      graphics.addObject(container);
      this.hasAddedToStage = true;
    }
    const cell = (this.cell = game.grid.getCell(h, v));
    const { bounds } = cell;
    this.vector[0] = vectorX;
    this.vector[1] = vectorY;
    const x = bounds.centerX;
    const y = bounds.centerY;

    const [prevX, prevY] = position;
    position[0] = x;
    position[1] = y;
    this.setLabelPosition();
    if (prevX === -1 && prevY === -1) {
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

  setLabelPosition() {
    const {
      vector: [vectorX, vectorY],
      label,
    } = this;
    if (vectorY === 1) {
      //top
      label.y = 25;
    } else if (vectorX === 1) {
      //left
      label.x = 50;
    } else if (vectorY === -1) {
      //bottom
      label.y = -30;
    } else if (vectorX === -1) {
      //right
      label.x = -50;
    }
  }

  gameInit() {}

  dispose() {
    this.graphics.removeObject(this.container);
  }

  onUpdate = () => {
    this.sprite.rotation += degToRad(1);
  };
}
