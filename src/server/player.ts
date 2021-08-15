import { EventEmitter } from 'eventemitter3';
import { Action, PlayerInfo, PlayerPositionInfo } from '../common';
import { Grid } from '../common/grid';
import { GridProxy } from '../common/proxy';
import { Client } from './client';
import { info } from './log';

export class ServerPlayer extends EventEmitter {
  client: Client;
  name: string;
  proxy: GridProxy;

  constructor(grid: Grid, client: Client, name: string) {
    super();
    this.client = client;
    this.name = name;
    this.proxy = new GridProxy(grid);
  }

  get info(): PlayerInfo {
    return {
      cid: this.client.id,
      n: this.name,
    };
  }

  get positionInfo(): PlayerPositionInfo {
    const { proxy } = this;
    const { cell, direction, lastDirection } = proxy;
    return {
      ...this.info,
      h: cell.h,
      v: cell.v,
      d: direction,
      ld: lastDirection,
    };
  }

  bufferInput(action: Action) {
    info(`Player[${this.client.id}].Input:`, action);
    this.proxy.action = action;
  }

  gameInit() {}

  gameStart() {}

  update() {
    this.proxy.update();
  }
}
