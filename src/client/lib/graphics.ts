import * as PIXI from 'pixi.js';
import { ease, EaseParams } from 'pixi-ease';

export const degToRad = (deg: number) => deg * (Math.PI / 180);
export const waitMs = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export enum EaseFn {}

export { PIXI };

export class Graphics {
  pixi: PIXI.Application;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const pixi = (this.pixi = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
    }));

    document.getElementById('canvas')!.appendChild(pixi.view);
  }

  get center(): [number, number] {
    return [this.width / 2, this.height / 2];
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

  addObject(object: PIXI.DisplayObject) {
    this.pixi.stage.addChild(object);
    return this;
  }

  removeObject(object: PIXI.DisplayObject) {
    this.pixi.stage.removeChild(object);
    return this;
  }

  ease(
    object: PIXI.DisplayObject,
    params: EaseParams,
    duration: number,
    easeFn: string,
    wait: number = 0,
    repeat: number = 0,
  ) {
    return ease.add(object, params, {
      duration,
      ease: easeFn,
      wait,
      repeat,
    });
  }
}
