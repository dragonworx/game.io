import {
  GameState,
  GameStatus,
  PlayerInfo,
  PlayerPositionInfo,
  gameStatusToString,
  CodeToAction,
} from '../../common';
import { Graphics } from './graphics';
import { ClientPlayer } from './player';
import { Alert } from './components/alert';
import { ClientSocketEvents } from '../../common/messaging';
import { Grid } from '../../common/grid';
import { GridView } from './gridView';
import { ClientIO } from './io';

export class ClientGame {
  io: ClientIO;
  graphics: Graphics;
  players: ClientPlayer[] = [];
  status: GameStatus = GameStatus.Unconnected;
  grid: Grid;
  gridView: GridView;
  userPlayer?: ClientPlayer;

  constructor(
    io: ClientIO,
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
    const { players, graphics, io, grid, gridView } = this;
    const player = new ClientPlayer(grid, io, playerInfo, graphics, gridView);
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

  updateGameStatus(status: GameStatus) {
    this.status = status;
    document.querySelector('#gameStatus')!.innerHTML =
      gameStatusToString(status);
  }

  hidePlayerNameInput() {
    const playerName = document.querySelector('#playerName')!;
    const header = document.querySelector('#main header')!;
    playerName.classList.add('ready');
    header.classList.remove('expanded');
    header.classList.add('collapsed');
  }

  showPlayerNameInput() {
    const playerName = document.querySelector('#playerName')!;
    const header = document.querySelector('#main header')!;
    playerName.classList.remove('ready');
    header.classList.remove('collapsed');
    header.classList.add('expanded');
  }

  init() {
    // this.showCountdown();
    this.players.forEach(player => player.gameInit());
  }

  start() {
    console.log('Game start');
    this.updateGameStatus(GameStatus.Running);
    if (this.userPlayer) {
      this.bindInputEvents();
    }
    this.players.forEach(player => player.gameStart());
  }

  stop() {
    console.log('Game stop');
    this.updateGameStatus(GameStatus.Over);
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
    const numericCode = CodeToAction[code];
    if (numericCode !== undefined) {
      this.io.messageUDP(ClientSocketEvents.SocketPlayerInput, numericCode);
    }
  };

  updateFromState(gameState: GameState) {
    this.status = gameState.s;
    document.querySelector('#fps')!.innerHTML = `${gameState.f.toFixed(1)}fps`;
    gameState.p.forEach(info => {
      const player = this.getPlayer(info.cid);
      player.updateFromState(info, gameState.f);
    });
  }
}
