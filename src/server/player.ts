import { PlayerInfo } from '../common';
import { Cell, Grid, Point } from '../common/grid';
import { GridProxy } from '../common/proxy';
import { Client } from './client';
import { ServerGame } from './game';
import { info } from './log';

export class ServerPlayer {
  client: Client;
  name: string;
  inputBuffer?: string;
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

  bufferInput(code: string) {
    info(`Player[${this.client.id}].Input:`, code);
    this.inputBuffer = code;
  }

  setInitialCell(cell: Cell, vector: Point) {
    this.proxy.cell = cell;
    this.proxy.vector = vector;
  }

  gameInit() {}

  gameStart() {}

  update() {
    this.proxy.update();
  }
}
