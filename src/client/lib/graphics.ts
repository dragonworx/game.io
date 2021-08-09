import * as PIXI from 'pixi.js';
import { resolveProjectReferencePath } from 'typescript';

export const degToRad = (deg: number) => deg * (Math.PI / 180);
export const waitMs = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export class Graphics {
  pixi: PIXI.Application;

  constructor(width: number, height: number) {
    const pixi = (this.pixi = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
    }));

    document.getElementById('canvas')!.appendChild(pixi.view);
  }

  loadTexture(
    assetName: string,
    path: string,
  ): Promise<PIXI.Texture<PIXI.Resource>> {
    return new Promise((resolve, reject) => {
      this.pixi.loader.add(assetName, path).load((_loader, resources) => {
        const texture = resources[assetName].texture;
        if (texture) {
          resolve(texture);
        } else {
          reject(new Error());
        }
      });
    });
  }

  addSprite(sprite: PIXI.Sprite) {
    this.pixi.stage.addChild(sprite);
  }
}
