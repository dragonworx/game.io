import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';
import { Graphics } from '../graphics';

export const AlertHeight = 40;

export class Alert extends EventEmitter {
  text: PIXI.Text;
  graphics: Graphics;
  static container: PIXI.Container = new PIXI.Container();
  static hasInit: boolean = false;

  static alerts: Alert[] = [];

  constructor(graphics: Graphics, message: string) {
    super();
    this.graphics = graphics;
    const text = (this.text = new PIXI.Text(message, {
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

    if (!Alert.hasInit) {
      graphics.addObject(Alert.container);
      Alert.hasInit = true;
    }
  }

  show() {
    const { text, graphics } = this;
    const [centerX, centerY] = graphics.center;
    Alert.alerts.push(this);
    text.x = centerX;
    text.y = 0;
    text.alpha = 0;
    text.anchor.x = text.anchor.y = 0.5;
    const index = Alert.alerts.findIndex(alert => alert === this);
    const offset = Alert.alerts.length * AlertHeight * 0.5;
    Alert.container.y = offset;
    Alert.container.addChild(text);
    graphics
      .ease(
        text,
        {
          alpha: 1,
          y: centerY - index * AlertHeight,
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
    const offset = Alert.alerts.length * AlertHeight * 0.5;
    graphics
      .ease(
        text,
        { x, y: y - offset, width: 0, height: 0 },
        duration,
        'easeOutBack',
        wait,
      )
      .on('complete', () => {
        Alert.container.removeChild(text);
        this.emit('hidden');
        Alert.alerts.pop();
      });
  }
}
