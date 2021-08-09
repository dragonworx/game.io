export class Player {
  name?: string;

  constructor() {}

  get hasName() {
    return this.name !== undefined;
  }
}
