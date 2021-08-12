import { PlayerInfo } from '../core';
import { Client } from './client';

export class Player {
  client: Client;
  name: string;

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
}
