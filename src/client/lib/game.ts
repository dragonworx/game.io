import {
  GameState,
  GameStatus,
  PlayerInfo,
  PlayerPositionInfo,
} from '../../common';
import { Graphics } from './graphics';
import { Player } from './player';
import { Alert } from './components/alert';
import { ClientEvents } from '../../common/messaging';
import { Grid } from '../../common/grid';
import { GridView } from './gridView';
import { IO } from './io';

export class Game {
  io: IO;
  graphics: Graphics;
  players: Player[] = [];
  status: GameStatus = GameStatus.Unconnected;
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
    const grid = (this.grid = new Grid(gridSize, gridDivisions, gridMargin));

    this.gridView = new GridView(grid, graphics);
  }

  getPlayer(clientId: string) {
    return this.players.find(player => player.info.cid === clientId)!;
  }

  newPlayer(playerInfo: PlayerInfo) {
    const { players, graphics, io } = this;
    const player = new Player(this, io, playerInfo, graphics);
    players.push(player);
    return player;
  }

  joinPlayer(info: PlayerInfo) {
    const { graphics, io } = this;
    const player = this.newPlayer(info);
    if (info.cid === io.clientId) {
      this.userPlayer = player;
    }
    const alert = new Alert(graphics, `"${info.n}" joined!`);
    alert.on('shown', () => {
      const [x, y] = player.position;
      alert.hide(x, y);
    });
    alert.show();
  }

  removePlayer(clientId: string) {
    const { players, graphics } = this;
    const index = players.findIndex(player => player.info.cid === clientId);
    if (index > -1) {
      const player = players[index];
      players.splice(index, 1);
      player.dispose();
      const alert = new Alert(graphics, `"${player.info.n}" disconnected!`);
      alert.on('shown', () => alert.hide(graphics.center[0], this.grid.margin));
      alert.show();
    }
  }

  initGridView() {
    this.gridView.init();
  }

  updatePlayerInitialPositions(playerPositionInfo: PlayerPositionInfo[]) {
    playerPositionInfo.forEach(info => {
      const player = this.getPlayer(info.cid);
      player.setInitialPosition(info);
    });
  }

  showCountdown() {
    const { graphics, grid } = this;
    const alert = new Alert(graphics, `Get ready in 3...`);
    alert.on('shown', () => {
      setTimeout(() => {
        alert.text.text = `Get ready in 2...`;
        setTimeout(() => {
          alert.text.text = `Get ready in 1...`;
          setTimeout(() => {
            alert.text.text = `Go!`;
            const [x, y] = grid.innerBounds.center;
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
      this.io.messageUDP(ClientEvents.SocketPlayerInput, numericCode);
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
    } else if (code === 'Space') {
      return 4;
    }
    return -1;
  }

  updateFromState(gameState: GameState) {
    this.status = gameState.s;
    gameState.p.forEach(info => {
      const player = this.getPlayer(info.cid);
      player.updateFromState(info);
    });
  }
}
