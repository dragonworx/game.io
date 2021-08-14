import { PlayerInfo, PlayerPositionInfo } from '../../common';
import { Grid } from '../../common/grid';
import { GridProxy } from '../../common/proxy';
import { degToRad, Graphics, PIXI } from './graphics';
import { ClientIO } from './io';

export class ClientPlayer {
  io: ClientIO;
  info: PlayerInfo;
  graphics: Graphics;
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  label: PIXI.Text;
  hasAddedToStage: boolean = false;
  proxy: GridProxy;

  constructor(grid: Grid, io: ClientIO, info: PlayerInfo, graphics: Graphics) {
    this.io = io;
    this.info = info;
    this.graphics = graphics;
    this.proxy = new GridProxy(grid);

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

  setInitialPosition(info: PlayerPositionInfo) {
    const { hasAddedToStage, graphics, proxy, container } = this;
    const [prevX, prevY] = proxy.setPosition(info);
    const [x, y] = proxy.position;

    this.setLabelPosition();

    if (!hasAddedToStage) {
      graphics.addObject(container);
      this.hasAddedToStage = true;
    }

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

  updateFromState(info: PlayerPositionInfo) {
    const { container, proxy } = this;
    proxy.setPosition(info);
    const [x, y] = proxy.position;
    container.x = x;
    container.y = y;
    this.setLabelPosition();
  }

  setLabelPosition() {
    const { label, proxy } = this;
    const [vectorX, vectorY] = proxy.vector;
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
    // this is mainly for graphics updates, server has authoritive updates
    this.sprite.rotation += degToRad(1);
  };
}
