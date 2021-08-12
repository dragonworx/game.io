import * as PIXI from 'pixi.js';
import { ease, EaseParams } from 'pixi-ease';

export const degToRad = (deg: number) => deg * (Math.PI / 180);
export const waitMs = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export enum EaseFn {}

export { PIXI };
export type Texture = PIXI.Texture<PIXI.Resource>;

export type TextureAssetName = 'cell' | 'blade';

export type TextureAsset = {
  name: TextureAssetName;
  path: string;
};

export const textureAssets: TextureAsset[] = [
  {
    name: 'cell',
    path: 'cell.png',
  },
  {
    name: 'blade',
    path: 'blade.png',
  },
];

export class Graphics {
  pixi: PIXI.Application;
  width: number;
  height: number;
  textures: Map<TextureAssetName, Texture> = new Map();

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

  preload() {
    return new Promise(resolve => {
      const loader = PIXI.Loader.shared;
      textureAssets.forEach(asset => loader.add(asset.name, asset.path));
      loader.load((_loader, resources) => {
        textureAssets.forEach(asset =>
          this.textures.set(asset.name, resources[asset.name].texture!),
        );
        resolve(this);
      });
    });
  }

  loadTexture(assetName: TextureAssetName, path: string) {
    this.pixi.loader.add(assetName, path).load((_loader, resources) => {
      const texture = resources[assetName].texture;
      if (texture) {
        this.textures.set(assetName, texture);
      }
    });
    return this;
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

  addTicker(fn: (elapsed: number) => void) {
    this.pixi.ticker.add(fn);
  }

  removeTicker(fn: (elapsed: number) => void) {
    this.pixi.ticker.remove(fn);
  }
}
