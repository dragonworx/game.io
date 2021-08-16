import { Direction, PlayerInfo, PlayerUpdateInfo } from '../../common';
import { Cell, Grid } from '../../common/grid';
import { AudioPlayer } from './audio';
import { Alert } from './components/alert';
import { degToRad, Graphics, PIXI } from './graphics';
import { GridView } from './gridView';
import { ClientIO } from './io';
import { Particles } from './particles';

export class ClientPlayer {
  grid: Grid;
  io: ClientIO;
  info: PlayerInfo;
  graphics: Graphics;
  audio: AudioPlayer;
  gridView: GridView;
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  glowSprite: PIXI.Sprite;
  label: PIXI.Text;
  hasAddedToStage: boolean = false;
  direction: Direction = Direction.Stationary;
  lastDirection: Direction = Direction.Stationary;
  cell: Cell;
  playerStatusEl: HTMLDivElement;
  isDead: boolean = false;
  isTakingDamage: boolean = false;
  paricles: Particles;
  tint: number;

  constructor(
    grid: Grid,
    io: ClientIO,
    info: PlayerInfo,
    graphics: Graphics,
    audio: AudioPlayer,
    gridView: GridView,
  ) {
    this.grid = grid;
    this.io = io;
    this.info = info;
    this.graphics = graphics;
    this.audio = audio;
    this.gridView = gridView;
    this.cell = grid.cells[0][0];

    const container = (this.container = new PIXI.Container());
    const label = (this.label = new PIXI.Text(info.n, {
      fontFamily: 'Orbitron',
      fontSize: 14,
      fill: '#ffffff',
      stroke: '#000000',
    }));

    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    const tint = (this.tint = PIXI.utils.rgb2hex([r, g, b]));

    this.paricles = new Particles(graphics, container);

    const glowTxture = graphics.textures.get('blade-glow');
    const glowSprite = (this.glowSprite = new PIXI.Sprite(glowTxture));
    glowSprite.anchor.x = glowSprite.anchor.y = 0.5;
    glowSprite.scale.x = glowSprite.scale.y = 0.5;
    container.addChild(glowSprite);

    const texture = graphics.textures.get('blade');
    const sprite = (this.sprite = new PIXI.Sprite(texture));
    sprite.tint = tint;
    sprite.width = sprite.height = grid.cellSize;
    sprite.anchor.x = sprite.anchor.y = 0.5;
    label.anchor.x = label.anchor.y = 0.5;
    container.addChild(sprite, label);

    graphics.addTicker(this.onLocalUpdate);

    this.playerStatusEl = document.querySelector('#playerStatus')!;
  }

  get position() {
    const { container } = this;
    return [container.x, container.y];
  }

  setInitialPosition(info: PlayerUpdateInfo) {
    const { hasAddedToStage, graphics, container, grid } = this;
    const { h, v, d } = info;
    const cell = grid.getCell(h, v)!;
    const [x, y] = cell.center;
    this.cell = cell;
    this.direction = d;
    const prevX = container.x;
    const prevY = container.y;

    this.setLabelPosition();

    if (!hasAddedToStage) {
      graphics.addObject(container);
      this.hasAddedToStage = true;
    }

    if (prevX === 0 && prevY === 0) {
      container.x = x;
      container.y = y;
    } else {
      graphics.ease(
        container,
        {
          x,
          y,
        },
        1000,
        'easeOutBack',
      );
    }
  }

  setLabelPosition() {
    const { label, direction } = this;
    if (direction === Direction.Down) {
      label.x = 0;
      label.y = 25;
    } else if (direction === Direction.Right) {
      label.x = 50;
      label.y = 0;
    } else if (direction === Direction.Up) {
      label.x = 0;
      label.y = -30;
    } else if (direction === Direction.Left) {
      label.x = -50;
      label.y = 0;
    }
  }

  gameInit() {
    this.isTakingDamage = false;
    this.sprite.tint = this.tint;
    this.label.visible = true;
  }

  gameStart() {
    this.label.visible = false;
    this.paricles.start();
  }

  dispose() {
    this.graphics.removeObject(this.container);
  }

  onLocalUpdate = (t: number) => {
    console.log(t);
    // this is mainly for graphics/animation updates, server has authoritive updates
    if (this.isDead) {
      return;
    }
    this.sprite.rotation += degToRad(5);
    this.glowSprite.rotation = this.sprite.rotation;
    this.glowSprite.alpha = Math.cos(Date.now() / 200) * 0.3 + 0.7;
    this.paricles.update(t);
  };

  remoteUpdate(info: PlayerUpdateInfo, userPlayer?: ClientPlayer) {
    // this is the update from the server game state
    const { container, grid, isDead } = this;
    if (isDead) {
      return;
    }
    const {
      cid: clientId,
      h,
      v,
      d: direction,
      ld: lastDirection,
      s: score,
      hl: health,
    } = info;
    const newCell = grid.getCell(h, v)!;
    const prevCell = this.cell;
    this.cell = newCell;
    this.direction = direction;
    this.lastDirection = lastDirection;
    const [x, y] = newCell.center;
    container.x = x;
    container.y = y;

    if (userPlayer && clientId === userPlayer.info.cid) {
      this.updatePlayerStatus(score, health);
    }

    if (health === 0 && !this.isDead) {
      this.die(userPlayer);
    }

    // animate break for previous cell
    if (prevCell !== newCell) {
      grid.breakCell(this.info.cid, prevCell);
    }

    // check for current collision
    if (newCell.isEmpty) {
      this.takeDamage();
      console.log('collision!', h, v);
    }

    // check for current cut
    grid.checkForCut(this.info.cid, newCell, direction, lastDirection);
  }

  takeDamage() {
    const { graphics, sprite, glowSprite, isTakingDamage, isDead } = this;
    if (isTakingDamage || isDead) {
      return;
    }
    this.audio.play('damage');
    graphics
      .ease(
        sprite,
        {
          tint: 0xff0000,
        },
        250,
        'easeOutBack',
        0,
        3,
      )
      .on('complete', () => {
        if (this.isDead) {
          return;
        }
        sprite.tint = this.tint;
        this.isTakingDamage = false;
      });
    graphics
      .ease(
        glowSprite,
        {
          tint: 0xff0000,
        },
        250,
        'easeOutBack',
        0,
        3,
      )
      .on('complete', () => {
        if (this.isDead) {
          return;
        }
        glowSprite.tint = this.tint;
      });
    this.isTakingDamage = true;
  }

  updatePlayerStatus(score: number, health: number) {
    const { playerStatusEl } = this;
    const scoreEl = playerStatusEl.querySelector('.score')!;
    const healthEl = playerStatusEl.querySelector(
      '.health-bar',
    )! as HTMLDivElement;
    scoreEl.innerHTML = `${score}`;
    healthEl.style.width = `${health}%`;
  }

  die(userPlayer?: ClientPlayer) {
    this.isDead = true;
    this.sprite.tint = 0xff0000;
    console.log('DEAD!', this.info.n);
    this.audio.play('dead');
    if (userPlayer && userPlayer.info.cid === this.info.cid) {
      const alert = new Alert(this.graphics, `You're toast!`);
      alert.on('shown', () => {
        alert.hide(this.grid.innerBounds.centerX, 0);
      });
      alert.show();
    }
    this.label.visible = false;
    this.sprite.filters = [new PIXI.filters.BlurFilter()];
    this.paricles.stop();
  }
}
