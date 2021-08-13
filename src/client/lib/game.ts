import { GameStatus, PlayerInfo } from '../../core';
import { Graphics } from './graphics';
import { Player } from './player';
import { Alert } from './components/alert';
import { ClientEvents } from '../../core/messaging';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import { IO } from './io';

export class Game {
  io: IO;
  graphics: Graphics;
  players: Player[] = [];
  status: GameStatus = 'unconnected';
  grid: Grid;
  gridView: GridView;
  userPlayer?: Player;

  constructor(
    io: IO,
    graphics: Graphics,
    gridSize: number,
    gridDivisions: number,
    gridMargin: number,
  ) {
    this.io = io;
    this.graphics = graphics;
    const grid = (this.grid = new Grid(
      gridSize,
      gridSize,
      gridDivisions,
      gridDivisions,
    ));

    this.gridView = new GridView(grid, graphics, gridMargin);
  }

  initGridView() {
    this.gridView.init();
    // for (let i = 1; i <= 10; i++) {
    //   this.newPlayer({
    //     clientId: `id${i}`,
    //     name: `Player ${i}`,
    //   });
    // }
  }

  newPlayer(info: PlayerInfo) {
    const { players, graphics, io } = this;
    const player = new Player(io, info, graphics);
    players.push(player);
    graphics.addObject(player.container);
    this.distributePlayers();
    return player;
  }

  joinPlayer(info: PlayerInfo) {
    const { graphics, io } = this;
    const player = this.newPlayer(info);
    if (info.clientId === io.clientId) {
      this.userPlayer = player;
    }
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
    player.dispose();
    const alert = new Alert(graphics, `"${player.info.name}" disconnected!`);
    alert.on('shown', () =>
      alert.hide(graphics.center[0], this.gridView.gridMargin),
    );
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

  init() {
    // this.showCountdown();
    this.players.forEach(player => player.gameInit());
  }

  start() {
    console.log('Game start');
    if (this.userPlayer) {
      this.bindInputEvents();
    }
  }

  stop() {
    console.log('Game stop');
    if (this.userPlayer) {
      this.unbindInputEvents();
    }
  }

  bindInputEvents() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  unbindInputEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    const { code } = e;
    const numericCode = this.getInputNumericCode(code);
    if (numericCode !== -1) {
      this.io.messageUDP(ClientEvents.PlayerInput, numericCode);
    }
  };

  getInputNumericCode(code: string) {
    if (code === 'ArrowLeft') {
      return 0;
    } else if (code === 'ArrowRight') {
      return 1;
    } else if (code === 'ArrowUp') {
      return 2;
    } else if (code === 'ArrowDown') {
      return 3;
    }
    return -1;
  }
}
