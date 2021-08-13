import { PlayerInfo } from '../../core';
import { degToRad, Graphics, PIXI } from './graphics';
import { IO } from './io';

export type Edge = 'top' | 'left' | 'bottom' | 'right';

export class Player {
  io: IO;
  info: PlayerInfo;
  initialPosition: [number, number] = [-1, -1];
  graphics: Graphics;
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  label: PIXI.Text;

  constructor(io: IO, info: PlayerInfo, graphics: Graphics) {
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

  setInitialPosition(x: number, y: number, edge: Edge) {
    const { initialPosition, container, graphics } = this;
    const [prevX, prevY] = initialPosition;
    initialPosition[0] = x;
    initialPosition[1] = y;
    this.setLabelPosition(edge);
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

  setLabelPosition(edge: Edge) {
    const { label } = this;
    if (edge === 'top') {
      label.y = 25;
    } else if (edge === 'left') {
      label.x = 50;
    } else if (edge === 'bottom') {
      label.y = -30;
    } else if (edge === 'right') {
      label.x = -50;
    }
  }

  // setMask(edge: Edge) {
  //   const { mask } = this;
  //   if (edge === 'top') {
  //     mask.x = -30;
  //     mask.y = 0;
  //   } else if (edge === 'left') {
  //   } else if (edge === 'bottom') {
  //   } else if (edge === 'right') {
  //   }
  // }

  gameInit() {}

  dispose() {
    this.graphics.removeObject(this.container);
  }

  onUpdate = () => {
    this.sprite.rotation += degToRad(1);
  };
}
