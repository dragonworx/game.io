import { PlayerInfo } from '../core';
import { Client } from './client';
import { info } from './log';

export class Player {
  client: Client;
  name: string;
  inputBuffer?: string;

  constructor(client: Client, name: string) {
    this.client = client;
    this.name = name;
  }

  get info(): PlayerInfo {
    return {
      clientId: this.client.id,
      name: this.name,
    };
  }

  bufferInput(code: string) {
    info(`Player[${this.client.id}].Input:`, code);
    this.inputBuffer = code;
  }
}
