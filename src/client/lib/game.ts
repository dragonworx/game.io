import { GameStatus, PlayerInfo } from '../../core';
import { Graphics } from './graphics';
import { Player } from './player';
import { Alert } from './components/alert';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';

export class Game {
  graphics: Graphics;
  players: Player[] = [];
  status: GameStatus = 'unconnected';
  grid: Grid;
  gridView: GridView;

  constructor(
    graphics: Graphics,
    gridSize: number,
    gridDivisions: number,
    gridMargin: number,
  ) {
    this.graphics = graphics;
    const grid = (this.grid = new Grid(
      gridSize,
      gridSize,
      gridDivisions,
      gridDivisions,
    ));

    this.gridView = new GridView(grid, graphics, gridMargin);
  }

  init() {
    this.gridView.init();
    // for (let i = 1; i <= 10; i++) {
    //   this.newPlayer({
    //     clientId: `id${i}`,
    //     name: `Player ${i}`,
    //   });
    // }
  }

  newPlayer(info: PlayerInfo) {
    const { players, graphics } = this;
    const player = new Player(info, graphics);
    players.push(player);
    graphics.addObject(player.container);
    this.distributePlayers();
    return player;
  }

  joinPlayer(info: PlayerInfo) {
    const { graphics } = this;
    const player = this.newPlayer(info);
    const alert = new Alert(graphics, `"${info.name}" joined!`);
    alert.on('shown', () => {
      const [x, y] = player.initialPosition;
      alert.hide(x, y);
    });
    alert.show();
  }

  removePlayer(clientId: string) {
    const { players, graphics } = this;
    const index = players.findIndex(
      player => player.info.clientId === clientId,
    );
    const player = players[index];
    players.splice(index, 1);
    graphics.removeObject(player.container);
    const alert = new Alert(graphics, `"${player.info.name}" disconnected!`);
    alert.on('shown', () => alert.hide(graphics.center[0], -10));
    alert.show();
  }

  distributePlayers() {
    const { players, grid, gridView } = this;
    const top: Player[] = [];
    const left: Player[] = [];
    const bottom: Player[] = [];
    const right: Player[] = [];
    const edges: Player[][] = [top, left, bottom, right];
    let index = 0;
    players.forEach(player => {
      const edge = edges[index];
      edge.push(player);
      index = (index + 1) % 4;
    });
    const topInc = Math.round(grid.hDivisions / (top.length + 1));
    const leftInc = Math.round(grid.vDivisions / (left.length + 1));
    const bottomInc = Math.round(grid.hDivisions / (bottom.length + 1));
    const rightInc = Math.round(grid.vDivisions / (right.length + 1));
    top.forEach((player, i) => {
      const [x, y] = gridView.getPosition(topInc * (i + 1), 0);
      player.setInitialPosition(x, y, 'top');
    });
    left.forEach((player, i) => {
      const [x, y] = gridView.getPosition(0, leftInc * (i + 1));
      player.setInitialPosition(x, y, 'left');
    });
    bottom.forEach((player, i) => {
      const [x, y] = gridView.getPosition(bottomInc * (i + 1), grid.vDivisions);
      player.setInitialPosition(x, y, 'bottom');
    });
    right.forEach((player, i) => {
      const [x, y] = gridView.getPosition(grid.hDivisions, rightInc * (i + 1));
      player.setInitialPosition(x, y, 'right');
    });
  }

  showCountdown() {
    const { graphics, gridView } = this;
    const alert = new Alert(graphics, `Get ready in 3...`);
    alert.on('shown', () => {
      setTimeout(() => {
        alert.text.text = `Get ready in 2...`;
        setTimeout(() => {
          alert.text.text = `Get ready in 1...`;
          setTimeout(() => {
            alert.text.text = `Go!`;
            const [x, y] = gridView.center;
            alert.hide(x, y);
          }, 1000);
        }, 1000);
      }, 1000);
    });
    alert.show();
  }

  start() {
    console.log('Game start');
  }
}
