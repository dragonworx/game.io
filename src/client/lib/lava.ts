import { Grid } from '../../common/grid';
import { Graphics, PIXI } from './graphics';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';

export class Lava {
  graphics: Graphics;
  grid: Grid;
  container: PIXI.Container;
  lava1: PIXI.Sprite;
  lava2: PIXI.Sprite;
  bloom: AdvancedBloomFilter;
  animate: boolean = true;

  constructor(graphics: Graphics, grid: Grid) {
    this.graphics = graphics;
    this.grid = grid;
    const bounds = grid.outerBounds;
    const width = bounds.width + 20;
    const height = bounds.height + 20;
    const lava1Texture = graphics.textures.get('lava1')!;
    const lava2Texture = graphics.textures.get('lava2')!;
    const container = (this.container = new PIXI.Container());
    this.container.alpha = 0.5;
    const bloom = (this.bloom = new AdvancedBloomFilter({
      threshold: 0.43,
      bloomScale: 1,
      brightness: 1.3,
      blur: 5.3,
      quality: 7,
    }));
    const lava1 = (this.lava1 = new PIXI.TilingSprite(
      lava1Texture,
      width,
      height,
    ));
    const lava2 = (this.lava2 = new PIXI.TilingSprite(
      lava2Texture,
      width,
      height,
    ));
    lava2.blendMode = PIXI.BLEND_MODES.SCREEN;
    container.filters = [bloom];
    lava1.width = lava2.width = width;
    lava1.height = lava2.height = height;
    graphics.addObject(container);
    container.addChild(lava1);
    container.addChild(lava2);
    const start = Date.now();

    graphics.addTicker(() => {
      if (!this.animate) {
        return;
      }
      const t = Date.now() - start;
      bloom.threshold = Math.abs(Math.sin(t / 1000));
      bloom.brightness = Math.abs(Math.sin(t / 500)) + 0.5;
      bloom.blur = Math.abs(Math.sin(t / 2000)) * 5 + 3;
      lava2.tilePosition.x += 1;
      lava2.tilePosition.y += 1;
      lava1.tilePosition.x -= 1;
      lava1.tilePosition.y += 0.5;
    });
  }
}
