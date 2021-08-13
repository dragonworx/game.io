import { PlayerInfo } from '../common';
import { Cell, Point } from '../common/grid';
import { Client } from './client';
import { info } from './log';

export class Player {
  client: Client;
  name: string;
  inputBuffer?: string;
  cell?: Cell;
  vector: Point = [0, 0];
  offset: number = 0;

  constructor(client: Client, name: string) {
    this.client = client;
    this.name = name;
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
    this.cell = cell;
    this.vector = vector;
  }

  gameInit() {}

  gameStart() {}

  update() {
    this.offset += 1;
  }
}
