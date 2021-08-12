export class Player {
  clientId: string;
  initialPosition: [number, number] = [0, 0];

  constructor(clientId: string) {
    this.clientId = clientId;
  }
}
