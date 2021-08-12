import { Component } from './component';
import * as PIXI from 'pixi.js';
import { ease } from 'pixi-ease';
import { Graphics } from '../graphics';

export class PlayerJoinedNotice extends Component<
  [Graphics, string],
  PIXI.Text
> {
  mount() {
    const [graphics, playerName] = this.input!;
    const text = new PIXI.Text(`"${playerName}" joined!`, {
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
        this.done(text);
      });
  }
}
