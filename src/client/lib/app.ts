import { IO } from './io';

export class App {
  io: IO;

  constructor() {
    this.io = new IO();
  }
}
