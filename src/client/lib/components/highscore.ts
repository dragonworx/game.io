import { EventEmitter } from 'eventemitter3';
import * as PIXI from 'pixi.js';
import {
  DialogFontSettings,
  DialogFontSizeBody,
  DialogFontSizeTitle,
  GridSize,
  GridMargin,
  PlayerUpdateInfo,
} from '../../../common';
import { Graphics } from '../graphics';

export const RowHeight = DialogFontSizeBody + 3;
export const TitleRestingY = GridSize * 0.2;

export class HighScore extends EventEmitter {
  text: PIXI.Text;
  graphics: Graphics;
  container: PIXI.Container;
  playerRank: PlayerUpdateInfo[];

  constructor(graphics: Graphics, playerRank: PlayerUpdateInfo[]) {
    super();
    this.graphics = graphics;
    const container = (this.container = new PIXI.Container());
    const text = (this.text = new PIXI.Text('High Scores', {
      ...DialogFontSettings,
      fontSize: DialogFontSizeTitle,
    }));
    text.anchor.x = text.anchor.y = 0.5;
    graphics.addObject(container);
    graphics.addObject(text);
    this.playerRank = playerRank;
  }

  createScores() {
    const { container, playerRank, graphics } = this;
    let y = TitleRestingY + DialogFontSizeTitle;
    playerRank.forEach((info, i) => {
      const name = new PIXI.Text(info.n, {
        ...DialogFontSettings,
        fontSize: DialogFontSizeBody,
        fill: i === 0 ? '#FFFF00' : 0xffffff,
      });
      const score = new PIXI.Text(String(info.s), {
        ...DialogFontSettings,
        fontSize: DialogFontSizeBody,
        fill: i === 0 ? '#FFFF00' : 0xffffff,
      });
      name.anchor.x = 1;
      score.anchor.x = 0;
      name.anchor.y = score.anchor.y = 0.5;
      name.y = score.y = y;
      name.x = score.x = GridMargin + graphics.center[0];
      container.addChild(name);
      container.addChild(score);
      y += RowHeight;
    });
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
        setTimeout(() => this.present(), 500);
      });
  }

  present() {
    const { graphics, text } = this;
    graphics
      .ease(text, { y: TitleRestingY }, 1000, 'easeOutBack')
      .on('complete', () => {
        this.createScores();
      });
  }
}
