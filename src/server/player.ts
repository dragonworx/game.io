import { Client } from './client';

export class Player {
  client: Client;
  name: string;

  constructor(client: Client, name: string) {
    this.client = client;
    this.name = name;
  }
}
