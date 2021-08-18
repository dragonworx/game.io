import { Graphics, PIXI } from './graphics';
import { Emitter } from 'pixi-particles';

export class Particles {
  emitter: Emitter;

  constructor(graphics: Graphics, container: PIXI.Container) {
    const texture = graphics.textures.get('blade');
    const emitter = (this.emitter = new Emitter(
      // The PIXI.Container to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the root stage Container
      container,

      // The collection of particle images to use
      [texture],

      // Emitter configuration, edit this to change the look
      // of the emitter
      config,
    ));
  }

  update(t: number) {
    this.emitter.update(t * 0.01);
  }

  start() {
    this.emitter.emit = true;
  }

  stop() {
    this.emitter.emit = false;
  }
}

export const config = {
  alpha: {
    start: 1,
    end: 0,
  },
  scale: {
    start: 0.3,
    end: 0.01,
    minimumScaleMultiplier: 1,
  },
  color: {
    start: '#e4f9ff',
    end: '#3fcbff',
  },
  speed: {
    start: 200,
    end: 50,
    minimumSpeedMultiplier: 1,
  },
  acceleration: {
    x: 0,
    y: 0,
  },
  maxSpeed: 0,
  startRotation: {
    min: 0,
    max: 360,
  },
  noRotation: true,
  rotationSpeed: {
    min: 0,
    max: 0,
  },
  lifetime: {
    min: 0.1,
    max: 0.3,
  },
  blendMode: 'screen',
  frequency: 0.001,
  emitterLifetime: -1,
  maxParticles: 500,
  pos: {
    x: 0,
    y: 0,
  },
  addAtBack: true,
  spawnType: 'circle',
  spawnCircle: {
    x: 0,
    y: 0,
    r: 0,
  },
};
