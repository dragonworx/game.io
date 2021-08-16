import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';
import { PlayerUpdateInfo } from '../../../common';
import { Graphics } from '../graphics';

export const AlertHeight = 40;

export class HighScore extends EventEmitter {
  text: PIXI.Text;
  graphics: Graphics;
  container: PIXI.Container;
  static hasInit: boolean = false;

  constructor(graphics: Graphics, playerRank: PlayerUpdateInfo[]) {
    super();
    this.graphics = graphics;
    const container = (this.container = new PIXI.Container());
    const text = (this.text = new PIXI.Text('High Score!', {
      fontFamily: 'Orbitron',
      fontSize: 26,
      fill: '#ffffff',
      stroke: '#000000',
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    }));
    text.anchor.x = text.anchor.y = 0.5;
    container.addChild(text);
    graphics.addObject(container);
  }

  show() {
    const { text, graphics } = this;
    const [centerX, centerY] = graphics.center;
    text.x = centerX;
    text.y = 0;
    text.alpha = 0;

    graphics
      .ease(
        text,
        {
          alpha: 1,
          y: centerY,
        },
        1000,
        'easeInOutBack',
      )
      .on('complete', () => {
        this.emit('shown');
      });
  }

  hide(x: number, y: number, duration: number = 1000, wait: number = 1000) {
    const { graphics, text } = this;
    graphics
      .ease(
        text,
        { x, y: y, width: 0, height: 0 },
        duration,
        'easeOutBack',
        wait,
      )
      .on('complete', () => {
        this.graphics.removeObject(this.container);
        this.emit('hidden');
      });
  }
}
