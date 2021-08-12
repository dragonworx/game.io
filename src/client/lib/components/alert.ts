import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';
import { Graphics } from '../graphics';

export class Alert extends EventEmitter {
  text: PIXI.Text;
  graphics: Graphics;

  constructor(graphics: Graphics, message: string) {
    super();
    this.graphics = graphics;
    this.text = new PIXI.Text(message, {
      fontFamily: 'Orbitron',
      fontSize: 26,
      fill: '#ffffff',
      stroke: '#000000',
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
  }

  show() {
    const { text, graphics } = this;
    const [centerX, centerY] = graphics.center;
    text.x = centerX;
    text.y = 0;
    text.alpha = 0;
    text.anchor.x = text.anchor.y = 0.5;
    graphics
      .addObject(text)
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
      .ease(text, { x, y, width: 0, height: 0 }, duration, 'easeOutBack', wait)
      .on('complete', () => {
        graphics.removeObject(text);
        this.emit('hidden');
      });
  }
}
