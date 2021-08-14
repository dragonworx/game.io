import { Action, PlayerInfo, PlayerPositionInfo } from '../common';
import { Grid } from '../common/grid';
import { GridProxy } from '../common/proxy';
import { Client } from './client';
import { info } from './log';

export class ServerPlayer {
  client: Client;
  name: string;
  proxy: GridProxy;

  constructor(grid: Grid, client: Client, name: string) {
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
    const { position, direction } = proxy;
    const [x, y] = position;
    return {
      ...this.info,
      x,
      y,
      d: direction,
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
