import { IO } from './io';
import * as PIXI from 'pixi.js';

export class App {
  io: IO;
  pixiApp: PIXI.Application;

  constructor() {
    this.io = new IO();
    const pixiApp = (this.pixiApp = new PIXI.Application({
      width: 500,
      height: 500,
      backgroundColor: 0xff0000,
    }));
    document.getElementById('main')!.appendChild(pixiApp.view);
    pixiApp.loader.add('cell', 'cell.png').load((loader, resources) => {
      const bunny = new PIXI.Sprite(resources['cell'].texture);

      // Setup the position of the bunny
      bunny.x = pixiApp.renderer.width / 2;
      bunny.y = pixiApp.renderer.height / 2;

      // Rotate around the center
      bunny.anchor.x = 0.5;
      bunny.anchor.y = 0.5;

      // Add the bunny to the scene we are building.
      pixiApp.stage.addChild(bunny);

      // Listen for frame updates
      pixiApp.ticker.add(() => {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;
      });
    });
  }
}
