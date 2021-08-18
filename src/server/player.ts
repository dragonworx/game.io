import { EventEmitter } from 'eventemitter3';
import { Action, PlayerInfo, PlayerPositionInfo } from '../common';
import { Grid } from '../common/grid';
import { GridProxy } from '../common/proxy';
import { Client } from './client';
import { info } from './log';

export class ServerPlayer extends EventEmitter {
  client: Client;
  name: string;
  tint: number;
  proxy: GridProxy;

  constructor(grid: Grid, client: Client, name: string, tint: number) {
    super();
    this.client = client;
    this.name = name;
    this.proxy = new GridProxy(client.id, grid);
    this.tint = tint;
  }

  get info(): PlayerInfo {
    return {
      cid: this.client.id,
      n: this.name,
    };
  }

  get positionInfo(): PlayerPositionInfo {
    const { proxy } = this;
    const { cell, direction, lastDirection, health, score } = proxy;
    return {
      ...this.info,
      h: cell.h,
      v: cell.v,
      d: direction,
      ld: lastDirection,
      s: score,
      hl: health,
    };
  }

  bufferInput(action: Action) {
    info(`Player[${this.client.id}].Input:`, action);
    this.proxy.action = action;
  }

  gameInit() {
    this.proxy.init();
  }

  gameStart() {}

  update() {
    const { proxy } = this;
    if (proxy.isDead) return;
    proxy.update();
  }
}
